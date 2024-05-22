import { ICategoryList } from "../../interfaces/category";
import { IOngkir, IOngkirList } from "../../interfaces/ongkir";
import { TUpdateOngkir } from "../../modules/ongkir-detail/schema";
import { api } from "../../services/api";

export async function getOngkirList({ page, isConfirmed }: { page?: number, isConfirmed?: boolean }) {
	const urlParam = new URLSearchParams();
	if (page) urlParam.append("page", page.toString());
	if (isConfirmed) urlParam.append("isConfirmed", isConfirmed.toString());
    const res = await api.get(`/ongkir?${urlParam.toString()}`);
    return res.data as { response: { data: IOngkirList, next_page_url?: string } };
}

export async function getOngkirDetail(id: number) {
	const res = await api.get(`/ongkir/${id}`);
	return res.data as { response: IOngkir };
}

export async function updateOngkir(param: TUpdateOngkir & { ongkirId: number }) {
	const res = await api.put(`/ongkir/${param.ongkirId}`, param);
	return res.data;
}