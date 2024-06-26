import { useEffect, useState } from "react";
import { useGetUlasanListByProdukId } from "../../../adapters/hooks/useUlasan";
import Icon from "../../../components/icon";

const ProductWithUlasan = ({ produkId }) => {
    const [page, setPage] = useState(1);
    const ulasan = useGetUlasanListByProdukId(produkId, page);
    const [avgRating, setAvgRating] = useState(0);
    const rating = ulasan.data?.response?.data.length;

    // avg rating
    useEffect(() => {
        if (ulasan.data?.response?.data.length > 0) {
            let total = 0;
            ulasan.data?.response?.data.map((item) => {
                total += item.rating;
            });
            setAvgRating(total / rating);
        }
    });

    // render star
    const renderStars = (avgRating) => {
        const stars = [];
        for (let i = 0; i < Math.floor(avgRating); i++) {
            stars.push(
                <div>
                    <div className="text-yellow-300">
                        <Icon key={i} nama="star" />
                    </div>
                </div>
            );
        }
        return stars;
    };

    return (
        <div className="flex gap-2">
            <div className="flex gap-1">{renderStars(avgRating)}</div>
            {rating > 0 && (
                <span className="text-slate-400">({rating} ulasan)</span>
            )}
        </div>
    );
};

export default ProductWithUlasan;
