import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  BaseTable,
  Block,
  Button,
  Grid,
  GridItem,
  Modal,
  Input,
  DateInput,
  Toggle,
  Box,
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
  const { t, i18n } = useTranslation("sponsor-details");
  const currencySymbol = localStorage.getItem("currency_symbol");

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterData, setFilterData] = useState(initialFilters);

  const [dataToDisplay, setDataToDisplay] = useState(data?.campaignsData);

  useEffect(() => {
    if (data && !dataToDisplay) {
      setDataToDisplay(data.campaignsData);
    }
  }, [data]);

  const rows = useMemo(() => {
    return [
      { label: t("campaign"), sortingKey: "name" },
      {
        label: t("used_total_coupons"),
        sortingKey: "usedCoupons",
        isNumbered: true,
        isCentered: true,
      },
      {
        label: t("coupon_price"),
        sortingKey: "couponPrice",
        isNumbered: true,
        isCentered: true,
      },
      {
        label: t("used_total_budget"),
        sortingKey: "usedBudget",
        isNumbered: true,
        isCentered: true,
      },
      {
        label: t("max_coupons"),
        sortingKey: "maxCouponsPerClient",
        isNumbered: true,
        isCentered: true,
      },
      { label: t("period"), sortingKey: "startDate", isDate: true },
      { label: t("status"), sortingKey: "status", isCentered: true },
    ];
  }, [i18n.language]);

  const rowsData = dataToDisplay.map((item) => {
    return [
      <p className="text ">{item.name}</p>,
      <p className="text centered">
        {item.couponData.length}/{item.numberOfCoupons}
      </p>,
      <p className="text centered">
        {item.couponPrice}
        {currencySymbol}
      </p>,
      <p className="text centered">
        {item.couponPrice * item.couponData.length}
        {currencySymbol}/{item.budget}
        {currencySymbol}
      </p>,
      <p className="text centered">{item.maxCouponsPerClient}</p>,
      <p className="text ">
        {getDateView(item.startDate)} - {getDateView(item.endDate)}
      </p>,
      <p className="text centered">{t(item.active ? "active" : "inactive")}</p>,
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
        ? new Date(x.startDate) >=
          new Date(new Date(filterData.startDate).setHours(0, 0, 0, 0))
        : true;
      const isEndDateMatching = filterData.endDate
        ? new Date(new Date(x.endDate).setHours(0, 0, 0, 0)) <=
          new Date(filterData.endDate)
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
      <Heading t={t} data={data} />
      <BaseTable
        data={dataToDisplay}
        updateData={setDataToDisplay}
        rows={rows}
        rowsData={rowsData}
        handleClickPropName="campaignId"
        menuOptions={menuOptions}
        hasSearch
        buttonLabel={t("add_campaign")}
        buttonAction={handleAddCampaign}
        secondaryButtonLabel={t("filter")}
        secondaryButtonAction={() => setIsFilterModalOpen(true)}
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

const Heading = ({ t, data }) => {
  return (
    <Grid classes="sponsor-details__grid">
      <GridItem md={8} lg={12}>
        <Box classes="sponsor-details__box">
          <Grid classes="sponsor-details__box__grid">
            <GridItem xs={4} md={2} lg={3}>
              <p>
                {t("campaigns")}: <strong>{data.campaigns}</strong>
              </p>
            </GridItem>

            <GridItem xs={4} md={2} lg={3}>
              <p>
                {t("active_campaigns")}: <strong>{data.activeCampaigns}</strong>
              </p>
            </GridItem>

            <GridItem xs={4} md={2} lg={3}>
              <p>
                {t("email")}: <strong>{data.email}</strong>
              </p>
            </GridItem>

            <GridItem xs={4} md={2} lg={3}>
              <p>
                {t("phone_number")}: <strong>{data.phone}</strong>
              </p>
            </GridItem>
          </Grid>
        </Box>
      </GridItem>
    </Grid>
  );
};
