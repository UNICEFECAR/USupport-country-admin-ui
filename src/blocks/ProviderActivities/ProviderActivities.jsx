import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";

import {
  BaseTable,
  Block,
  Button,
  DropdownWithLabel,
  Input,
  Modal,
} from "@USupport-components-library/src";
import {
  getDateView,
  getTimeFromDate,
  ONE_HOUR,
  downloadCSVFile,
} from "@USupport-components-library/utils";

import "./provider-activities.scss";

/**
 * ProviderActivities
 *
 * Provider activities block
 *
 * @return {jsx}
 */
export const ProviderActivities = ({ isLoading, data, providerName }) => {
  const { t, i18n } = useTranslation("provider-activities");
  const currencySymbol = localStorage.getItem("currency_symbol");

  const [dataToDisplay, setDataToDisplay] = useState(data);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    setDataToDisplay(data);
  }, [data]);

  const rows = useMemo(() => {
    return [
      {
        label: t("client"),
        sortingKey: "displayName",
      },
      {
        label: t("time"),
        sortingKey: "time",
        isCentered: true,
        isDate: true,
      },
      {
        label: t("price"),
        sortingKey: "price",
        isCentered: true,
      },
      {
        label: t("campaign"),
        sortingKey: "campaignName",
        isCentered: true,
      },
    ];
  }, [i18n.language]);

  const handleExport = () => {
    let csv = "";

    csv += rows.map((x) => x.label).join(",");

    dataToDisplay.forEach((row) => {
      const price = row.price ? `${row.price}${currencySymbol}` : t("free");
      csv += "\n";
      csv += `${row.displayName},`;
      csv += `${getFormattedDate(row.time, false)},`;
      csv += `${price},`;
      csv += `${row.campaignName || "N/A"}`;
    });

    const reportDate = new Date().toISOString().split("T")[0];
    const fileName = `Report-${providerName}-${reportDate}.csv`;
    downloadCSVFile(csv, fileName);
  };

  const handleFilterOpen = () => {
    setIsFilterOpen(true);
  };

  const filterSingleActivity = (activity, currentFilters) => {
    const isStartDateMatching = currentFilters.startDate
      ? new Date(activity.time) >=
        new Date(new Date(currentFilters.startDate).setHours(0, 0, 0, 0))
      : true;

    const isEndDateMatching = currentFilters.endDate
      ? new Date(new Date(activity.time).setHours(0, 0, 0, 0)) <=
        new Date(currentFilters.endDate).getTime()
      : true;

    const isCampaignMatching = currentFilters.campaign
      ? activity.campaignName === currentFilters.campaign
      : true;

    return isStartDateMatching && isEndDateMatching && isCampaignMatching;
  };

  const handleFilterSave = (currentFilters) => {
    const filtered = data?.filter((x) =>
      filterSingleActivity(x, currentFilters)
    );
    setDataToDisplay(filtered);
  };

  const getFormattedDate = (date, hasComma = true) => {
    const endTime = new Date(date.getTime() + ONE_HOUR);

    const displayTime = getTimeFromDate(date);
    const displayEndTime = getTimeFromDate(endTime);

    return `${displayTime} - ${displayEndTime}${
      hasComma ? "," : ""
    } ${getDateView(date)}`;
  };

  const rowsData = dataToDisplay?.map((activity) => {
    const displayTime = getFormattedDate(activity.time);

    return [
      <p className="text">{activity.displayName}</p>,
      <p className="text centered">{displayTime}</p>,
      <p className="text centered">
        {activity.price ? `${activity.price}${currencySymbol}` : t("free")}
      </p>,
      <p className="text centered">{activity.campaignName || "N/A"}</p>,
    ];
  });

  let campaignOptions = Array.from(
    new Set(data?.filter((x) => x.campaignName).map((x) => x.campaignName))
  ).map((x) => {
    return {
      value: x,
      label: x,
    };
  });

  return (
    <Block classes="provider-activities">
      <BaseTable
        buttonAction={handleExport}
        buttonLabel={t("export_label")}
        data={dataToDisplay}
        hasMenu={false}
        hasSearch
        isLoading={isLoading}
        rows={rows}
        rowsData={rowsData}
        secondaryButtonAction={handleFilterOpen}
        secondaryButtonLabel={t("filter")}
        t={t}
        updateData={setDataToDisplay}
      />
      <Filters
        isOpen={isFilterOpen}
        handleClose={() => setIsFilterOpen(false)}
        handleSave={handleFilterSave}
        campaignOptions={campaignOptions}
        t={t}
      />
    </Block>
  );
};

const Filters = ({ isOpen, handleClose, handleSave, t, campaignOptions }) => {
  const initialData = {
    startDate: "",
    endDate: "",
    campaign: "",
  };
  const [data, setData] = useState(initialData);

  const handleChange = (field, value) => {
    setData({
      ...data,
      [field]: value,
    });
  };

  const handleSubmit = () => {
    handleSave(data);
    handleClose();
  };

  const handleFilterReset = () => {
    handleSave(initialData);
    setData(initialData);
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      closeModal={handleClose}
      heading={t("filters")}
      classes="provider-activities__filter-modal"
    >
      <>
        <div>
          {campaignOptions.length > 0 && (
            <DropdownWithLabel
              label={t("campaign")}
              selected={data.campaign}
              setSelected={(value) => handleChange("campaign", value)}
              options={campaignOptions}
            />
          )}
          <div className="provider-activities__filter-modal__date-container">
            <Input
              type="date"
              label={t("start_date")}
              onChange={(e) => handleChange("startDate", e.currentTarget.value)}
              value={data.startDate}
              placeholder="DD.MM.YYY"
              classes="provider-activities__filter-modal__date-picker"
            />
            <Input
              type="date"
              label={t("end_date")}
              onChange={(e) => handleChange("endDate", e.currentTarget.value)}
              value={data.endDate}
              placeholder="DD.MM.YYY"
              classes="provider-activities__filter-modal__date-picker"
            />
          </div>
        </div>
        <div>
          <Button
            label={t("apply_filter")}
            size="lg"
            onClick={handleSubmit}
            classes="provider-activities__filter-modal__submit-button"
          />
          <Button
            label={t("reset_filter")}
            size="lg"
            type="secondary"
            onClick={handleFilterReset}
            classes="provider-activities__filter-modal__reset-button"
          />
        </div>
      </>
    </Modal>
  );
};
