import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  Block,
  BaseTable,
  CheckBox,
  InputSearch,
} from "@USupport-components-library/src";

import { cmsSvc, adminSvc } from "@USupport-components-library/services";
import {
  filterAdminData,
  getDateView,
} from "@USupport-components-library/utils";
import { noImagePlaceholder } from "@USupport-components-library/assets";

import { useError } from "#hooks";

import "./videos.scss";

/**
 * Videos
 *
 * Videos block for content management
 *
 * @return {jsx}
 */
export const Videos = ({ t, i18n }) => {
  const [dataToDisplay, setDataToDisplay] = useState();
  const [searchValue, setSearchValue] = useState("");
  const [videoIds, setVideoIds] = useState([]);

  const rows = useMemo(() => {
    return [
      {
        label: t("published"),
        sortingKey: "isSelected",
        isCentered: true,
      },
      {
        label: t("thumbnail"),
        isCentered: true,
      },
      {
        label: t("table_title"),
        sortingKey: "title",
      },
      {
        label: t("description"),
        sortingKey: "description",
      },
      {
        label: t("url"),
        sortingKey: "url",
        isCentered: true,
      },
      {
        label: t("category"),
        sortingKey: "category",
        isCentered: true,
      },
      {
        label: t("likes"),
        sortingKey: "likes",
        isCentered: true,
      },
      {
        label: t("dislikes"),
        sortingKey: "dislikes",
        isCentered: true,
      },
      {
        label: t("created_at"),
        sortingKey: "createdAt",
        isCentered: true,
      },
    ];
  }, [i18n.language]);

  //--------------------- Videos ----------------------//
  const getVideos = async () => {
    // Request video ids from the master DB
    const videoIds = await adminSvc.getVideos();
    setVideoIds(videoIds);
    let { data } = await cmsSvc.getVideos({
      locale: i18n.language,
      ids: videoIds,
      isForAdmin: true,
      populate: true,
    });

    const filteredData = filterAdminData(data.data, data.meta.localizedIds);

    setDataToDisplay(
      filteredData.map((x) => ({
        isSelected: !!x.isSelected,
        id: x.id,
        ...x.attributes,
        likes: Number(x.attributes.likes) || 0,
        dislikes: Number(x.attributes.dislikes) || 0,
      }))
    );

    return filteredData;
  };

  const { isLoading } = useQuery(["videos", i18n.language], getVideos);

  const handleSelectVideo = async (id, newValue, index) => {
    let newData = JSON.parse(JSON.stringify(dataToDisplay));
    newData[index].isSelected = newValue;

    let idToUse = id;
    if (newValue === false) {
      if (!videoIds.includes(id)) {
        const currentData = dataToDisplay[index];
        const dataLocalizations = currentData.localizations.data;

        const videoIdToUse = dataLocalizations.find((x) =>
          videoIds.includes(x.id.toString())
        );
        if (videoIdToUse) {
          idToUse = videoIdToUse.id;
        }
      }
    }

    updateVideosMutation.mutate({
      id: idToUse.toString(),
      newValue,
      videoData: newData,
    });
  };

  const updateVideos = async (data) => {
    try {
      const videoAvailableLocales = await cmsSvc.getVideoLocales(data.id);

      const currentLang = i18n.language;
      if (data.newValue === true) {
        await adminSvc.putVideo(videoAvailableLocales[currentLang].toString());
      } else {
        await adminSvc.deleteVideo(data.id.toString());
      }
      return data.newValue;
    } catch (error) {
      console.error("Error updating video:", error);
      throw error;
    }
  };

  const updateVideosMutation = useMutation(updateVideos, {
    onMutate: (data) => {
      const oldData = JSON.parse(JSON.stringify(dataToDisplay));

      // Perform an optimistic update to the UI
      setDataToDisplay(data.videoData);

      return () => {
        setDataToDisplay(oldData);
      };
    },
    onSuccess: (isAdding) => {
      toast(t(isAdding ? "video_added" : "video_removed"));
    },
    onError: (error, _, rollback) => {
      const { message: errorMessage } = useError(error);
      toast(errorMessage, { type: "error" });
      rollback();
    },
  });

  const rowsData = dataToDisplay?.map((video, index) => {
    const category = video.category?.data?.attributes?.name || "";

    const searchFields = [video.title, video.description, video.url, category];

    if (
      searchValue &&
      !searchFields.some((x) =>
        x?.toLowerCase().includes(searchValue.toLowerCase())
      )
    ) {
      return null;
    }

    return [
      <div>
        <CheckBox
          classes="videos-row__checkbox"
          isChecked={video.isSelected}
          setIsChecked={() =>
            handleSelectVideo(video.id, !video.isSelected, index)
          }
        />
      </div>,
      <img
        className="videos__thumbnail"
        src={
          video.thumbnail?.data?.attributes?.formats?.thumbnail?.url ||
          video.thumbnail?.data?.attributes?.formats?.small?.url ||
          video.thumbnail?.data?.attributes?.url ||
          noImagePlaceholder
        }
        alt={video.title}
      />,
      <div>
        <p className="text heading videos-row__heading">{video.title}</p>
      </div>,
      <div>
        <p className="small-text">{video.description}</p>
      </div>,
      <div>
        {video.url ? (
          <a href={video.url} target="_blank" rel="noreferrer">
            <p className="text videos-row__heading centered">
              {video.url.length > 30
                ? video.url.substring(0, 30) + "..."
                : video.url}
            </p>
          </a>
        ) : (
          <p className="centered">-</p>
        )}
      </div>,
      <div>
        <p className="text centered">{category || "-"}</p>
      </div>,
      <p className="text centered">{video.likes}</p>,
      <p className="text centered">{video.dislikes}</p>,
      <p className="text centered">{getDateView(new Date(video.createdAt))}</p>,
    ];
  });

  return (
    <Block classes="videos">
      <InputSearch
        placeholder={t("search")}
        value={searchValue}
        onChange={(val) => setSearchValue(val)}
        classes="videos__search"
      />
      <BaseTable
        rows={rows}
        rowsData={rowsData}
        data={dataToDisplay}
        updateData={setDataToDisplay}
        hasMenu={false}
        isLoading={isLoading}
        noteText={t("note")}
        t={t}
      />
    </Block>
  );
};
