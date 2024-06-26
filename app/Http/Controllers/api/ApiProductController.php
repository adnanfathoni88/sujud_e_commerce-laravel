<?php

namespace App\Http\Controllers\api;

// use App\Http\Controllers\Controller;

use App\Models\Gambar;
use App\Models\Produk;
use App\Models\Varian;
use App\Traits\ResponseFormat;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ApiProductController extends Controller
{
	use ResponseFormat;


	public function top_sale(Request $req) 
	{
		$r2 = DB::table("transaksis")
			->join("pesanans", "pesanans.pesanan_grup", "=", "transaksis.pesanan_grup")
			->join("varians", "varians.id", "=", "pesanans.varian_id")
			->join("produks", "produks.id", "=", "varians.produk_id")
			->select(DB::raw("count(pesanans.id) as total_pembelian"), "produks.id")
			->groupBy("pesanans.varian_id", "produks.id")
			->where('transaksis.status', 'SUCCESS')
			->limit(2)
			->get();

		$r3 = Produk::whereIn('id', $r2->pluck('id'))
			->select("id", "nama", "kategori_id")
			->with('kategori:id,nama', 'varian:id,produk_id,gambar_id','varian.gambar:nama,id')->get();

		$r4 = DB::table('ulasans')
			->join('varians', 'varians.id', '=', 'ulasans.varian_id')
			->join('produks', 'produks.id', '=', 'varians.produk_id')
			->select(DB::raw("avg(ulasans.rating) as rating"), "produks.id")
			->groupBy("produks.id")
			->get();

		$r3->map(function($item) use($r2, $r4) {
			$item->total_pembelian = $r2->where('id', $item->id)->first()->total_pembelian;
			$item->rating = $r4->where('id', $item->id)->first()->rating;
			return $item;
		});


		return $this->res($r3, 200);
	}


    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
		$query = $request ->query('q');
		$kategori_id = $request ->query('kategori_id');
		if($query) {
			$m = Produk::where('nama', 'like', "%$query%")
				->where(function($q) use($kategori_id) {
					if($kategori_id) $q->where('kategori_id', $kategori_id);
				})
				->with('kategori')
				->with('varian.gambar')
				->orderBy('created_at', 'desc')
				->paginate(15);
			return $this->res($m, 200);
		}
		$m = Produk::where(function($q) use($kategori_id) {
				if($kategori_id) $q->where('kategori_id', $kategori_id);
			})
			->with('kategori')
			->with('varian.gambar')
			->orderBy('created_at', 'desc')
			->paginate(15);
		return $this->res($m, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
		$validator = Validator::make($request->all(), [
			// produk
			'kode' => 'required|max:255',
			'nama' => 'required|max:255',
			'deskripsi' => 'required|max:255',
			'kategori_id' => 'required|exists:kategoris,id',
			// varian
			'warna' => 'required|max:255',
			'ukuran' => 'required|max:255',
			'harga' => 'required|numeric|min:0',
			'stok' => 'required|numeric|min:1',
			// image
			'image' => 'required|image|mimes:jpeg,png|max:3072'
		]);

		if ($validator->fails()) return $this->res($validator->messages(), 400);

		
		$file = $request->file('image');
		$filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
		$file->storeAs('uploaded', $filename, 'public');
		
		DB::transaction(function () use($request, $filename) {
			$m = new Produk();
			$m->nama = $request->nama;
			$m->kode = $request->kode;
			$m->deskripsi = $request->deskripsi;
			$m->kategori_id = $request->kategori_id;
			$m->save();
			
			$m3 = new Gambar();
			$m3->nama = $filename;
			$m3->save();
			
			$m2 = new Varian();
			$m2->stok = $request->stok;
			$m2->harga = $request->harga;
			$m2->warna = $request->warna;
			$m2->ukuran = $request->ukuran;
			$m2->gambar_id = $m3->id;
			$m2->produk_id = $m->id;
			$m2->save();	
		});

		return $this->res("Inserted", 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
		$m = Produk::with('kategori')->with('varians.gambar')->find($id);
		if(!$m) return $this->res("Produk not found", 404);
		return $this->res($m, 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
			'kode' => 'required|max:255',
			'nama' => 'required|max:255',
			'deskripsi' => 'required|max:255',
			'kategori_id' => 'required|exists:kategoris,id'
		]);

		if ($validator->fails()) return $this->res($validator->messages(), 400);

		$m = Produk::find($id);
		if(!$m) return $this->res("Produk not found", 404);

        $m->nama = $request->nama;
        $m->kode = $request->kode;
        $m->deskripsi = $request->deskripsi;
        $m->kategori_id = $request->kategori_id;
        $m->save();

		return $this->res($m, 201);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
		$variant = Varian::where('produk_id', $id)->get();
		DB::transaction(function () use($id, $variant) {
			$gambar_id = $variant->pluck('gambar_id');
			Varian::where('produk_id', $id)->delete();
			Gambar::whereIn('id', $gambar_id->toArray())->delete();
			Produk::destroy($id);
		});
		return $this->res("Success Delete", 201);
    }
}
