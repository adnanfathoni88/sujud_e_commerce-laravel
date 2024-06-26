import { Button, DialogPanel, DialogTitle } from "@headlessui/react";
import CategoryModal from "../../components/modal";
import TextGroup from "../../components/text-group";
import { FormEvent, useRef, useState } from "react";
import { useEditCategory } from "../../adapters/hooks/useCategory";
import { toastSuccess } from "../../utils/toast";
import { PiNotePencilLight } from "react-icons/pi";

export default function UpdateCategory({
    id,
    nama,
}: {
    nama: string;
    id: number;
}) {
    const update = useEditCategory();
    const [open, setOpen] = useState(false);
    const formRef = useRef<HTMLFormElement | undefined>();

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const param: { id: number; nama: string } = {
            id,
            nama: formData.get("kategori") as string,
        };
        update.mutate(param, {
            onSuccess: () => {
                setOpen(false);
                toastSuccess("Berhasil mengupdate!");
            },
        });
    };

    return (
        <CategoryModal
            open={open}
            title="Buat Kategori"
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            Trigger={
                <button
                    className="hover:text-primary"
                    onClick={() => setOpen(true)}
                >
                    <PiNotePencilLight size={20} />
                </button>
            }
        >
            <DialogPanel className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-boxdark-2">
                <DialogTitle
                    as="h3"
                    className="text-base/7 font-semibold text-black dark:text-white"
                >
                    Edit Kategori
                </DialogTitle>
                <form onSubmit={onSubmit} ref={formRef}>
                    <TextGroup
                        title=""
                        required
                        type="text"
                        name="kategori"
                        placeholder="Nama Kategori"
                        defaultValue={nama}
                    />
                    <div className="mt-4">
                        <Button
                            type="submit"
                            className="block ml-auto items-center gap-2 rounded-md bg-first py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none"
                        >
                            Simpan
                        </Button>
                    </div>
                </form>
            </DialogPanel>
        </CategoryModal>
    );
}
