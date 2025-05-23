import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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

import "./sos-center.scss";

/**
 * SOSCenter
 *
 * SOSCenter block
 *
 * @return {jsx}
 */
export const SOSCenter = () => {
  const { i18n, t } = useTranslation("sos-center");

  const [dataToDisplay, setDataToDisplay] = useState();
  const [searchValue, setSearchValue] = useState("");
  const [sosCenterIds, setSOSCenterIds] = useState([]);

  const rows = useMemo(() => {
    return [
      {
        label: t("published"),
        sortingKey: "isSelected",
        isCentered: true,
      },
      {
        label: t("image"),
        isCentered: true,
      },
      {
        label: t("content"),
        sortingKey: "title",
      },
      {
        label: t("url"),
        sortingKey: "url",
        isCentered: true,
      },
      {
        label: t("phone"),
        sortingKey: "phone",
        isCentered: true,
      },
      {
        label: t("published_at"),
        sortingKey: "publishedAt",
        isCentered: true,
      },
    ];
  }, [i18n.language]);

  //--------------------- SOS Centers ----------------------//
  const getSOSCenters = async () => {
    // Request SOS centers ids from the master DB
    const sosCentersIds = await adminSvc.getSOSCenters();
    setSOSCenterIds(sosCentersIds);

    let { data } = await cmsSvc.getSOSCenters({
      locale: i18n.language,
      ids: sosCentersIds,
      isForAdmin: true,
      populate: true,
    });

    const filteredData = filterAdminData(data.data, data.meta.localizedIds);

    setDataToDisplay(
      filteredData.map((x) => ({
        isSelected: !!x.isSelected,
        id: x.id,
        ...x.attributes,
      }))
    );

    return filteredData;
  };

  const { isLoading } = useQuery(["SOSCenters", i18n.language], getSOSCenters);

  const handleSelectSOSCenter = async (id, newValue, index) => {
    let newData = JSON.parse(JSON.stringify(dataToDisplay));
    newData[index].isSelected = newValue;

    let idToUse = id;
    if (newValue === false) {
      // If the SOS center is being deselected, we need to get the id which is stored in the database
      if (!sosCenterIds.includes(id)) {
        const currentData = dataToDisplay[index];
        const dataLocalizations = currentData.localizations.data;

        const sosCenterIdToUse = dataLocalizations.find((x) =>
          sosCenterIds.includes(x.id.toString())
        );
        if (sosCenterIdToUse) {
          idToUse = sosCenterIdToUse.id;
        }
      }
    }
    updateSOSCentersMutation.mutate({
      id: idToUse.toString(),
      newValue,
      sosCenterData: newData,
    });
  };

  const updateSOSCenters = async (data) => {
    const sosCenterAvailableLocales = await cmsSvc.getSOSCenterAvailableLocales(
      data.id
    );

    const currentLang = i18n.language;
    if (data.newValue === true) {
      await adminSvc.putSOSCenters(
        sosCenterAvailableLocales[currentLang].toString()
      );
    } else {
      await adminSvc.deleteSOSCenters(data.id.toString());
    }
    return data.newValue;
  };

  const updateSOSCentersMutation = useMutation(updateSOSCenters, {
    onMutate: (data) => {
      const oldData = JSON.parse(JSON.stringify(dataToDisplay));

      // Perform an optimistic update to the UI
      setDataToDisplay(data.sosCenterData);

      return () => {
        // queryClient.setQueryData(["SOSCenters", i18n.language], oldData);
        setDataToDisplay(oldData);
      };
    },
    onSuccess: (isAdding) => {
      toast(t(isAdding ? "sos_center_added" : "sos_center_removed"));
    },
    onError: (error, variables, rollback) => {
      const { message: errorMessage } = useError(error);
      toast(errorMessage, { type: "error" });
      rollback();
    },
  });

  const rowsData = dataToDisplay?.map((sosCenter, index) => {
    const searchFields = [
      sosCenter.title,
      sosCenter.text,
      sosCenter.url,
      sosCenter.phone,
    ];

    if (
      searchValue &&
      !searchFields.some((x) => x?.toLowerCase().includes(searchValue))
    ) {
      return null;
    }
    return [
      <div>
        <CheckBox
          classes="sos-center-row__checkbox"
          isChecked={sosCenter.isSelected}
          setIsChecked={() =>
            handleSelectSOSCenter(sosCenter.id, !sosCenter.isSelected, index)
          }
        />
      </div>,
      <img
        className="sos-center__image"
        src={sosCenter.image?.data?.attributes?.url || noImagePlaceholder}
      />,
      <div>
        <p className="text heading sos-center-row__heading">
          {sosCenter.title}
        </p>
        <p className="small-text">{sosCenter.text}</p>
      </div>,
      <div>
        {sosCenter.url ? (
          <a href={sosCenter.url} target="_blank" rel="noreferrer">
            <p className="text sos-center-row__heading centered">
              {sosCenter.url}
            </p>
          </a>
        ) : (
          <p className="centered">-</p>
        )}
      </div>,

      <div>
        {sosCenter.phone ? (
          <a href={`tel:${sosCenter.phone}`} target="_blank" rel="noreferrer">
            <p className="text sos-center-row__heading centered centered">
              {sosCenter.phone}
            </p>
          </a>
        ) : (
          <p className="centered">-</p>
        )}
      </div>,
      <p className="text centered">
        {getDateView(new Date(sosCenter.publishedAt))}
      </p>,
    ];
  });

  return (
    <Block classes="sos-center">
      <InputSearch
        placeholder={t("search")}
        value={searchValue}
        onChange={(val) => setSearchValue(val)}
        classes="sos-center__search"
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
