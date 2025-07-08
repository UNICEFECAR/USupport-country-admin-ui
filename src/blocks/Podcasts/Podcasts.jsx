import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import {
  Block,
  BaseTable,
  CheckBox,
  InputSearch,
  Toggle,
} from "@USupport-components-library/src";
import { cmsSvc, adminSvc } from "@USupport-components-library/services";
import {
  filterAdminData,
  getDateView,
} from "@USupport-components-library/utils";
import { noImagePlaceholder } from "@USupport-components-library/assets";

import { useError, useUpdateContentActiveStatus } from "#hooks";

import "./podcasts.scss";

/**
 * Podcasts
 *
 * Podcasts block for content management
 *
 * @return {jsx}
 */
export const Podcasts = ({ t, i18n }) => {
  const [dataToDisplay, setDataToDisplay] = useState();
  const [searchValue, setSearchValue] = useState("");
  const [podcastIds, setPodcastIds] = useState([]);
  const [isPodcastsActive, setIsPodcastsActive] = useState(false);
  const [hasCheckedPodcastsActive, setHasCheckedPodcastsActive] =
    useState(false);

  const queryClient = useQueryClient();

  const currentCountry = localStorage.getItem("country");
  const countriesData = queryClient.getQueryData(["countries"]);

  useEffect(() => {
    if (countriesData && !hasCheckedPodcastsActive) {
      const currentCountryData = countriesData.find(
        (x) => x.value === currentCountry
      );
      setIsPodcastsActive(currentCountryData?.podcastsActive);
      setHasCheckedPodcastsActive(true);
    }
  }, [countriesData]);

  const onUpdateContentActiveStatusSuccess = () => {
    toast(t("save_success"));
    queryClient.invalidateQueries(["countries"]);
  };

  const onUpdateContentActiveStatusError = (errorMessage, _, rollback) => {
    toast(errorMessage, { type: "error" });
    // Rollback the optimistic update
    if (rollback) {
      rollback();
    }
  };

  const onUpdateContentActiveStatusMutate = (data) => {
    // Store the current state for rollback
    const currentState = isPodcastsActive;

    // Perform optimistic update
    const newActiveState = data.status === "enabled";
    setIsPodcastsActive(newActiveState);

    // Return rollback function
    return () => {
      setIsPodcastsActive(currentState);
    };
  };

  const updateContentActiveStatusMutation = useUpdateContentActiveStatus(
    onUpdateContentActiveStatusSuccess,
    onUpdateContentActiveStatusError,
    onUpdateContentActiveStatusMutate
  );

  const handleTogglePodcastsActive = (newValue) => {
    const status = newValue ? "enabled" : "disabled";
    updateContentActiveStatusMutation.mutate({
      contentType: "podcasts",
      status,
    });
  };

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

  //--------------------- Podcasts ----------------------//
  const getPodcasts = async () => {
    // Request podcast ids from the master DB
    const podcastIds = await adminSvc.getPodcasts();
    setPodcastIds(podcastIds);
    let { data } = await cmsSvc.getPodcasts({
      locale: i18n.language,
      ids: podcastIds,
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

  const { isLoading } = useQuery(["podcasts", i18n.language], getPodcasts);

  const handleSelectPodcast = async (id, newValue, index) => {
    let newData = JSON.parse(JSON.stringify(dataToDisplay));
    newData[index].isSelected = newValue;

    let idToUse = id;
    if (newValue === false) {
      // If the podcast is being removed, we need to get the id of the localized version
      if (!podcastIds.includes(id)) {
        const currentData = dataToDisplay[index];
        const dataLocalizations = currentData.localizations.data;

        const podcastIdToUse = dataLocalizations.find((x) =>
          podcastIds.includes(x.id.toString())
        );
        if (podcastIdToUse) {
          idToUse = podcastIdToUse.id;
        }
      }
    }

    updatePodcastsMutation.mutate({
      id: idToUse.toString(),
      newValue,
      podcastData: newData,
    });
  };

  const updatePodcasts = async (data) => {
    try {
      const podcastAvailableLocales = await cmsSvc.getPodcastLocales(data.id);

      const currentLang = i18n.language;
      if (data.newValue === true) {
        await adminSvc.putPodcast(
          podcastAvailableLocales[currentLang].toString()
        );
      } else {
        await adminSvc.deletePodcast(
          podcastAvailableLocales[currentLang].toString()
        );
      }
      return data.newValue;
    } catch (error) {
      console.error("Error updating podcast:", error);
      throw error;
    }
  };

  const updatePodcastsMutation = useMutation(updatePodcasts, {
    onMutate: (data) => {
      const oldData = JSON.parse(JSON.stringify(dataToDisplay));

      // Perform an optimistic update to the UI
      setDataToDisplay(data.podcastData);

      return () => {
        setDataToDisplay(oldData);
      };
    },
    onSuccess: (isAdding) => {
      toast(t(isAdding ? "podcast_added" : "podcast_removed"));
    },
    onError: (error, _, rollback) => {
      console.log(error);
      const { message: errorMessage } = useError(error);
      toast(errorMessage, { type: "error" });
      rollback();
    },
  });

  const rowsData = dataToDisplay?.map((podcast, index) => {
    const category = podcast.category?.data?.attributes?.name || "";

    const searchFields = [
      podcast.title,
      podcast.description,
      podcast.audioUrl,
      category,
    ];

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
          classes="podcasts-row__checkbox"
          isChecked={podcast.isSelected}
          setIsChecked={() =>
            handleSelectPodcast(podcast.id, !podcast.isSelected, index)
          }
        />
      </div>,
      <img
        className="podcasts__thumbnail"
        src={
          podcast.thumbnail?.data?.attributes?.formats?.thumbnail?.url ||
          podcast.thumbnail?.data?.attributes?.formats?.small?.url ||
          podcast.thumbnail?.data?.attributes?.url ||
          noImagePlaceholder
        }
        alt={podcast.title}
      />,
      <div>
        <p className="text heading podcasts-row__heading">{podcast.title}</p>
      </div>,
      <div>
        <p className="small-text">{podcast.description}</p>
      </div>,
      <div>
        {podcast.url ? (
          <a href={podcast.url} target="_blank" rel="noreferrer">
            <p className="text podcasts-row__heading centered">
              {podcast.url.length > 30
                ? podcast.url.substring(0, 30) + "..."
                : podcast.url}
            </p>
          </a>
        ) : (
          <p className="centered">-</p>
        )}
      </div>,
      <div>
        <p className="text centered">{category || "-"}</p>
      </div>,
      <p className="text centered">{podcast.likes}</p>,
      <p className="text centered">{podcast.dislikes}</p>,
      <p className="text centered">
        {getDateView(new Date(podcast.createdAt))}
      </p>,
    ];
  });

  return (
    <Block classes="podcasts">
      <div className="podcasts__toggle-container">
        <Toggle
          isToggled={isPodcastsActive}
          setParentState={handleTogglePodcastsActive}
          shouldChangeState={false}
          label={t("podcasts_active")}
          labelClasses="podcasts__toggle-label"
        />
      </div>
      <InputSearch
        placeholder={t("search")}
        value={searchValue}
        onChange={(val) => setSearchValue(val)}
        classes="podcasts__search"
      />
      <BaseTable
        rows={rows}
        rowsData={rowsData}
        data={dataToDisplay}
        updateData={setDataToDisplay}
        hasMenu={false}
        isLoading={isLoading}
        noteText={t("note_podcasts")}
        t={t}
      />
    </Block>
  );
};
