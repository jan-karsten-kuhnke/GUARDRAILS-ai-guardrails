import React, { FC, useState, useRef, useEffect } from "react";
import { Tile } from "../../types/tiles";
import HomeContext from "@/pages/home/home.context";
import { useContext } from "react";
import "./styles.scss";
import { RequestAccess } from "@/services";

const RequestAccessComponent: FC = () => {
    const [loading, setLoading] = useState(false);
    const {
        state: { selectedTile, theme },
        dispatch
    } = useContext(HomeContext);


    const AccessRequest = (curr_tile: Tile) => {
        setLoading(true)
        let obj = {
            tile_code: curr_tile?.code,
            tile_name: curr_tile?.title
        }
        RequestAccess(obj).then((res) => {
            if (res && res.data) {
                let requestedTile = { ...selectedTile, request_submitted: true }
                dispatch({ field: "selectedTile", value: requestedTile ?? {} });
                setLoading(false);
            }
        }).catch((err) => {
            console.log("error", err);
            setLoading(false);
        });
    }

    return (
        <>
            <div className={`flex flex-col justify-center rounded-lg py-2 text-[${theme.textColorSecondary}]`}>
                You are not authorized to the use the above functionality
                {!selectedTile.has_access && !selectedTile.request_submitted ?
                    <button className={`mt-5 request_btn ${theme.chatItemsBorder}`}
                        onClick={() => AccessRequest(selectedTile)}>
                        {!loading ? 'Request Access' :
                            <div className={`h-4 w-4 animate-spin rounded-full border-t-2 ${theme.chatLoadingTheme}`}></div>}
                    </button> :
                    !selectedTile.has_access ?
                        <button className={`disable_request_btn mt-5 ${theme.chatItemsBorder}`}>Already Requested</button> : ""}
            </div>
        </>
    );
};

export default RequestAccessComponent;
