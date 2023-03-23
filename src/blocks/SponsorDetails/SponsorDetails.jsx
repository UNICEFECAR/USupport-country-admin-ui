import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  BaseTable,
  Block,
  Button,
  Grid,
  GridItem,
  InputSearch,
  Modal,
  Input,
  DateInput,
  Toggle,
} from "@USupport-components-library/src";

import { getDateView } from "@USupport-components-library/utils";

const initialFilters = {
  minUsedCoupons: 0,
  minCouponPrice: 0,
  minUsedBudget: 0,
  minMaxCouponsPerClient: 0,
  startDate: "",
  endDate: "",
  showOnlyActive: false,
};

import "./sponsor-details.scss";

/**
 * SponsorDetails
 *
 * Sponsor details block
 *
 * @return {jsx}
 */
export const SponsorDetails = ({ data }) => {
  const navigate = useNavigate();
  const { t } = useTranslation("sponsor-details");
  const currencySymbol = localStorage.getItem("currency_symbol");

  const [searchValue, setSearchValue] = useState("");

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterData, setFilterData] = useState(initialFilters);

  const [dataToDisplay, setDataToDisplay] = useState(data?.campaignsData);

  useEffect(() => {
    if (data && !dataToDisplay) {
      setDataToDisplay(data.campaignsData);
    }
  }, [data]);

  const rows = [
    t("campaign"),
    t("used_total_coupons"),
    t("coupon_price"),
    t("used_total_budget"),
    t("max_coupons"),
    t("period"),
    t("status"),
  ];

  const rowsData = dataToDisplay
    ?.filter((x) => x.name.toLowerCase().includes(searchValue.toLowerCase()))
    .map((item) => {
      return [
        <p>{item.name}</p>,
        <p>
          {item.couponData.length}/{item.numberOfCoupons}
        </p>,
        <p>
          {item.couponPrice}
          {currencySymbol}
        </p>,
        <p>
          {item.couponPrice * item.couponData.length}
          {currencySymbol}/{item.budget}
          {currencySymbol}
        </p>,
        <p>{item.maxCouponsPerClient}</p>,
        <p>
          {getDateView(item.startDate)} - {getDateView(item.endDate)}
        </p>,
        <p>{t(item.active ? "active" : "inactive")}</p>,
      ];
    });

  const handleNavigate = (id, route) => {
    const campaignData = data.campaignsData?.find((x) => x.campaignId === id);
    navigate(`/${route}?campaignId=${id}`, {
      state: {
        sponsorName: data.sponsorName,
        sponsorImage: data.image,
        campaignData,
      },
    });
  };
  const menuOptions = [
    {
      icon: "view",
      text: t("view"),
      handleClick: (id) => handleNavigate(id, "campaign-details"),
    },
    {
      icon: "edit",
      text: t("edit"),
      handleClick: (id) => handleNavigate(id, "edit-campaign"),
    },
  ];

  const handleAddCampaign = () =>
    navigate(`/add-campaign?sponsorId=${data.sponsorId}`, {
      state: { sponsorName: data.sponsorName, sponsorImage: data.image },
    });

  const handleFilterSave = () => {
    let dataCopy = [...data.campaignsData];

    dataCopy = dataCopy.filter((x) => {
      const isMinUsedCouponMatching =
        Number(x.usedCoupons) >= Number(filterData.minUsedCoupons);
      const isMinCouponPriceMatching =
        Number(x.couponPrice) >= Number(filterData.minCouponPrice);
      const isMinUsedBudgetMatching =
        Number(x.usedBudget) >= Number(filterData.minUsedBudget);
      const isMinMaxCouponsPerClientMatching =
        Number(x.maxCouponsPerClient) >=
        Number(filterData.minMaxCouponsPerClient);
      const isStartDateMatching = filterData.startDate
        ? new Date(x.startDate) >= new Date(filterData.startDate)
        : true;
      const isEndDateMatching = filterData.endDate
        ? new Date(x.endDate) <= new Date(filterData.endDate)
        : true;
      const isStatusMatching = filterData.showOnlyActive
        ? x.active === filterData.showOnlyActive
        : true;

      return (
        isMinUsedCouponMatching &&
        isMinCouponPriceMatching &&
        isMinUsedBudgetMatching &&
        isMinMaxCouponsPerClientMatching &&
        isStartDateMatching &&
        isEndDateMatching &&
        isStatusMatching
      );
    });
    setDataToDisplay(dataCopy);
    setIsFilterModalOpen(false);
  };

  const handleFilterChange = (field, e) => {
    const value = e.target.value;
    setFilterData({ ...filterData, [field]: value });
  };

  const handleFilterReset = () => {
    setFilterData(initialFilters);
    setDataToDisplay(data.campaignsData);
    setIsFilterModalOpen(false);
  };
  return (
    <Block classes="sponsor-details">
      <div className="sponsor-details__buttons-container">
        <Button
          onClick={() => setIsFilterModalOpen(true)}
          label={t("filter")}
          type="secondary"
          color="purple"
          size="md"
        />
        <Button
          label={t("add_campaign")}
          color="purple"
          size="md"
          onClick={handleAddCampaign}
        />
      </div>
      <Grid classes="sponsor-details__grid">
        <GridItem md={2} lg={2} classes="sponsor-details__grid-item">
          <p>
            {t("campaigns")}: <strong>{data.campaigns}</strong>
          </p>
        </GridItem>

        <GridItem md={2} lg={2} classes="sponsor-details__grid-item">
          <p>
            {t("active_campaigns")}: <strong>{data.activeCampaigns}</strong>
          </p>
        </GridItem>

        <GridItem md={2} lg={3} classes="sponsor-details__grid-item">
          <p>
            {t("email")}: <strong>{data.email}</strong>
          </p>
        </GridItem>

        <GridItem md={2} lg={3} classes="sponsor-details__grid-item">
          <p>
            {t("phone_number")}:{" "}
            <strong>
              {data.phonePrefix} {data.phone}
            </strong>
          </p>
        </GridItem>

        <GridItem md={8} lg={2} classes="sponsor-details__grid-item">
          <InputSearch
            placeholder={t("search")}
            value={searchValue}
            onChange={setSearchValue}
          />
        </GridItem>
      </Grid>
      <BaseTable
        data={dataToDisplay}
        rows={rows}
        rowsData={rowsData}
        handleClickPropName="campaignId"
        menuOptions={menuOptions}
        t={t}
      />

      <Modal
        heading={t("filter_heading")}
        isOpen={isFilterModalOpen}
        closeModal={() => setIsFilterModalOpen(false)}
        classes="sponsor-details__filter-modal"
      >
        <Input
          type="number"
          label={t("min_used_coupons")}
          value={filterData.minUsedCoupons}
          onChange={(e) => handleFilterChange("minUsedCoupons", e)}
        />
        <Input
          type="number"
          label={t("min_coupon_price")}
          value={filterData.minCouponPrice}
          onChange={(e) => handleFilterChange("minCouponPrice", e)}
        />
        <Input
          type="number"
          label={t("min_used_budget")}
          value={filterData.minUsedBudget}
          onChange={(e) => handleFilterChange("minUsedBudget", e)}
        />
        <Input
          type="number"
          label={t("min_max_coupons_per_client")}
          value={filterData.minMaxCouponsPerClient}
          onChange={(e) => handleFilterChange("minMaxCouponsPerClient", e)}
        />
        <DateInput
          label={t("start_date")}
          value={filterData.startDate}
          onChange={(e) => handleFilterChange("startDate", e)}
        />
        <DateInput
          label={t("end_date")}
          value={filterData.endDate}
          onChange={(e) => handleFilterChange("endDate", e)}
        />
        <div className="sponsor-details__filter-modal__toggle-container">
          <p>{t("show_only_active")}</p>
          <Toggle
            isToggled={filterData.showOnlyActive}
            setParentState={() =>
              setFilterData({
                ...filterData,
                showOnlyActive: !filterData.showOnlyActive,
              })
            }
          />
        </div>

        <Button
          label={t("apply_filter")}
          size="lg"
          onClick={handleFilterSave}
          classes="sponsor-details__filter-modal__cta"
        />
        <Button
          label={t("reset_filter")}
          size="lg"
          type="secondary"
          onClick={handleFilterReset}
          classes="sponsor-details__filter-modal__cta"
        />
      </Modal>
    </Block>
  );
};
