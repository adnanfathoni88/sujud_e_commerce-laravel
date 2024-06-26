import { Button, DialogPanel, DialogTitle } from '@headlessui/react'
import { IVariant } from "../../interfaces/variant";
import Modal from "../../components/modal";
import { useState } from "react";
import TextGroup from '../../components/text-group';
import ImageInput from '../../components/image-input';
import Select from '../../components/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateVarian } from './schema';
import { useEditVarianById } from '../../adapters/hooks/useVarian';
import { toastError, toastSuccess } from '../../utils/toast';

export default function VarianUpdate({ productId, varian }: { productId: number, varian: IVariant }) {
	const [open, setOpen] = useState(false)
	const updateVarian = useEditVarianById()
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(UpdateVarian),
		defaultValues: {
			image: undefined,
			warna: varian.warna,
			ukuran: varian.ukuran,
			stok: varian.stok.toString(),
			harga: varian.harga.toString(),
			harga_diskon: (varian?.harga_diskon ?? 0).toString()
		},
	})

	const onSubmit = handleSubmit((data) => {
		updateVarian.mutate({ id: varian.id, productId, body: data }, {
			onSuccess: () => {
				setOpen(false)
				toastSuccess("Varian berhasil diupdate")
			},
			onError: () => toastError("Gagal mengupdate varian")
		})
	})

	return (
		<Modal
			open={ open }
			title="Buat Kategori"
			onOpen={ () => setOpen(true) }
			onClose={ () => setOpen(false) }
			Trigger={ (<button onClick={ () => setOpen(true) } className="rounded-md bg-first py-2 px-4 text-sm font-medium text-white w-full mt-7">Edit</button>) }
		>
			<DialogPanel className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-boxdark-2">
				<DialogTitle as="h3" className="text-base/7 mb-5 font-semibold text-black dark:text-white">
					Update Varian
				</DialogTitle>
				<form onSubmit={onSubmit}>
					<TextGroup
						required
						type="text"
						title="Warna"
						errorMessage={ errors.warna?.message }
						{ ...register('warna') }
					/>
					<div className="mt-4">
						<TextGroup
							required
							type="number"
							title="Harga"
							errorMessage={ errors.harga?.message }
							{ ...register('harga') }
						/>
					</div>
					<div className="mt-4">
						<TextGroup
							required
							type="number"
							title="Potongan Harga"
							errorMessage={ errors.harga_diskon?.message }
							{ ...register('harga_diskon') }
						/>
					</div>
					<div className="mt-4">
						<TextGroup
							required
							type="number"
							title="Stok"
							errorMessage={ errors.stok?.message }
							{ ...register('stok') }
						/>
					</div>
					<div className="mt-4">
						<ImageInput
							label="Gambar"
							defaultImage={ `/api/uploaded/${varian?.gambar?.nama}` }
							error={ errors.image?.message as string }
							{ ...register('image') }
						/>
					</div>
					<div className="mt-4">
						<Select
							name="ukuran"
							label="Ukuran"
							options={ [
								{ id: 'S', nama: "S" },
								{ id: 'M', nama: "M" },
								{ id: 'L', nama: "L" },
								{ id: 'XL', nama: "XL" },
								{ id: 'XXL', nama: "XXL" }
							] }
							error={ errors?.ukuran?.message }
							{ ...register("ukuran") }
						/>
					</div>
					<button
						type="submit"
						disabled={updateVarian.isPending}
						className="mt-8 px-15 py-3 ml-auto block text-white w-100 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-md text-sm sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 w-full"
					>
						Submit
					</button>
				</form>
			</DialogPanel>
		</Modal>
	)
}