import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
  Block,
  Button,
  Loading,
  DropdownWithLabel,
  Input,
  Modal,
} from "@USupport-components-library/src";
import {
  getDateView,
  getTimeFromDate,
  ONE_HOUR,
} from "@USupport-components-library/utils";

import "./provider-activities.scss";

/**
 * ProviderActivities
 *
 * Provider activities block
 *
 * @return {jsx}
 */
export const ProviderActivities = ({ isLoading, data }) => {
  const { t } = useTranslation("provider-activities");
  const rows = ["client", "time", "price", "campaign"];

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});

  const handleExport = () => {};
  const handleFilterOpen = () => {
    setIsFilterOpen(true);
  };

  const handleFilterSave = (data) => {
    setFilters(data);
  };

  const filterData = (activity) => {
    // TODO: Add filter for campaigns
    const isStartDateMatching = filters.startDate
      ? new Date(activity.time).getTime() >=
        new Date(filters.startDate).getTime()
      : true;

    const isEndDateMatching = filters.endDate
      ? new Date(activity.time).getTime() <= new Date(filters.endDate).getTime()
      : true;

    return isStartDateMatching && isEndDateMatching ? true : false;
  };

  const renderData = useMemo(() => {
    const filteredData = data?.filter(filterData);

    if (!filteredData || filteredData?.length === 0)
      return (
        <tr>
          <td
            className="provider-activities__table__td__no-results"
            align="center"
            colSpan={4}
          >
            <h4>{t("no_results")}</h4>
          </td>
        </tr>
      );

    return filteredData?.map((activity, index) => {
      const endTime = new Date(activity.time.getTime() + ONE_HOUR);

      const displayTime = getTimeFromDate(activity.time);
      const displayEndTime = getTimeFromDate(endTime);

      return (
        <tr key={index}>
          <td className="provider-activities__table__td">
            <p className="text provider-activities__table__name">
              {activity.displayName}
            </p>
          </td>
          <td className="provider-activities__table__td">
            <p className="text provider-activities__table__name">
              {displayTime} - {displayEndTime}, {getDateView(activity.time)}
            </p>
          </td>
          <td className="provider-activities__table__td">
            <p className="text">{activity.price || t("free")}</p>
          </td>
          <td className="provider-activities__table__td">
            <p className="text">{activity.campaign || "N/A"}</p>
          </td>
        </tr>
      );
    });
  }, [data, filters]);

  let campaignOptions =
    data
      ?.map((x) => {
        if (x.campaign) {
          return { value: x.campaign, label: x.campaign };
        }
        return null;
      })
      .filter((x) => x !== null) || [];

  return (
    <Block classes="provider-activities">
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <div className="provider-activities__buttons">
            <Button
              type="secondary"
              color="purple"
              label={t("export_label")}
              onClick={handleExport}
              size="md"
            />
            <Button
              type="primary"
              color="purple"
              label={t("filter")}
              onClick={handleFilterOpen}
              size="md"
            />
          </div>
          <div className="provider-activities__container">
            <table className="provider-activities__table">
              <thead>
                <tr>
                  {rows.map((row, index) => {
                    return <th key={row + index}>{t(row)}</th>;
                  })}
                </tr>
              </thead>
              <tbody>{renderData}</tbody>
            </table>
          </div>
        </>
      )}
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
  const [data, setData] = useState({
    startDate: "",
    endDate: "",
  });

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
          <Button label={t("submit")} size="lg" onClick={handleSubmit} />
        </div>
      </>
    </Modal>
  );
};