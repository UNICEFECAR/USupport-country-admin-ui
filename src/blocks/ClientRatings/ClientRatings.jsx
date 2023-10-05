import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
  Block,
  Button,
  DropdownWithLabel,
  DateInput,
  Loading,
  Rating,
  ReportCollapsible,
  Modal,
  InputSearch,
} from "@USupport-components-library/src";

import { useGetClientRatings } from "#hooks";

import {
  getDateView,
  getTimeFromDate,
} from "@USupport-components-library/utils";

import "./client-ratings.scss";

/**
 * ClientRatings
 *
 * Client ratings report block
 *
 * @return {jsx}
 */
export const ClientRatings = ({ Heading }) => {
  const { t } = useTranslation("client-ratings");
  const { isLoading, data } = useGetClientRatings();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [searchValue, setSearchValue] = useState("");

  const handleFilterSave = (filterData) => {
    setFilters(filterData);
  };

  const filterRatings = (rating) => {
    const isRatingMatching =
      filters.rating && filters.rating !== "all"
        ? rating.rating >= filters.rating
        : true;

    const isStartingDateMatching = filters.startingDate
      ? new Date(rating.createdAt).getTime() >=
        new Date(new Date(filters.startingDate).setHours(0, 0, 0)).getTime()
      : true;

    const isEndDateMatching = filters.endingDate
      ? new Date(rating.createdAt).getTime() <=
        new Date(new Date(filters.endingDate).setHours(23, 59, 59)).getTime()
      : true;

    const searchVal = searchValue.toLowerCase();
    const isSearchMatching = !searchVal
      ? true
      : rating.comment?.toLowerCase().includes(searchVal) ||
        String(rating.rating)?.includes(searchVal);

    return isRatingMatching &&
      isStartingDateMatching &&
      isSearchMatching &&
      isEndDateMatching
      ? rating
      : false;
  };

  const renderRatings = useMemo(() => {
    if (!data) return null;

    const filteredRatings = data.filter(filterRatings);
    if (filteredRatings.length === 0) return <p>{t("no_results")}</p>;

    return filteredRatings
      .sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .map((suggestion, index) => {
        return (
          <ReportCollapsible
            key={index}
            headingItems={[
              <div className="client-ratings__rating-container">
                <p className="client-ratings__rating-container__label">
                  {t("rating")}
                </p>
                <Rating rating={suggestion.rating} />
              </div>,

              <p>
                {t("time")}:
                <strong>
                  {" "}
                  {getTimeFromDate(suggestion.createdAt)},{" "}
                  {getDateView(suggestion.createdAt)}
                </strong>
              </p>,
            ]}
            contentHeading={t("content_heading")}
            contentText={suggestion.comment}
          />
        );
      });
  }, [data, filters, searchValue]);

  return (
    <Block classes="client-ratings">
      <Heading
        headingLabel={t("heading")}
        handleButtonClick={() => setIsFilterOpen(true)}
      />
      <InputSearch
        placeholder={t("search")}
        value={searchValue}
        onChange={setSearchValue}
      />

      {isLoading ? <Loading /> : renderRatings}
      <Filters
        filters={filters}
        isOpen={isFilterOpen}
        handleClose={() => setIsFilterOpen(false)}
        handleSave={handleFilterSave}
        t={t}
      />
    </Block>
  );
};

const Filters = ({ isOpen, handleClose, handleSave, filters, t }) => {
  const initialFilters = {
    rating: "all",
    startingDate: "",
    endingDate: "",
  };
  const [data, setData] = useState({
    rating: "all",
    startingDate: filters.startingDate,
    endingDate: filters.endingDate,
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

  const handleResetFilters = () => {
    setData(initialFilters);
    handleSave(initialFilters);
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      heading={t("filters")}
      closeModal={handleClose}
      classes="client-ratings__backdrop"
    >
      <>
        <div>
          <DropdownWithLabel
            label={t("minimum_rating")}
            selected={data.rating}
            setSelected={(value) => handleChange("rating", value)}
            options={[
              { value: "all", label: t("all") },
              { value: 1, label: "1" },
              { value: 2, label: "2" },
              { value: 3, label: "3" },
              { value: 4, label: "4" },
              { value: 5, label: "5" },
            ]}
          />
          <DateInput
            label={t("starting_date")}
            onChange={(e) =>
              handleChange("startingDate", e.currentTarget.value)
            }
            value={data.startingDate}
            placeholder="DD.MM.YYY"
            classes={["client-ratings__backdrop__date-picker"]}
          />
          <DateInput
            label={t("ending_date")}
            onChange={(e) => handleChange("endingDate", e.currentTarget.value)}
            value={data.endingDate}
            placeholder="DD.MM.YYY"
            classes={["client-ratings__backdrop__date-picker"]}
          />
        </div>
        <div className="client-ratings__backdrop__buttons-container">
          <Button label={t("submit")} size="lg" onClick={handleSubmit} />
          <Button
            label={t("reset_filters")}
            size="lg"
            type="secondary"
            onClick={handleResetFilters}
          />
        </div>
      </>
    </Modal>
  );
};
