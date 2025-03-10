import React, { useCallback, useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import {
  BaseTable,
  Block,
  Button,
  DateInput,
  DropdownWithLabel,
  Grid,
  GridItem,
  Loading,
  Modal,
  Toggle,
  Box,
} from "@USupport-components-library/src";

import {
  pascalToSnakeCase,
  getDateView,
  downloadCSVFile,
} from "@USupport-components-library/utils";

import {
  useGetCouponsData,
  useUpdateCampaignData,
  useGetCountryAges,
} from "#hooks";

import "./campaign-details.scss";

/**
 * CampaignDetails
 *
 * Campaign details block
 *
 * @return {jsx}
 */
export const CampaignDetails = ({
  campaignData,
  campaignId,
  sponsorId,
  campaign,
}) => {
  const fieldsToDisplay = [
    "couponCode",
    "usedCoupons",
    "numberOfCoupons",
    "couponPrice",
    "usedBudget",
    "budget",
    "maxCouponsPerClient",
    "startDate",
    "endDate",
  ];

  const initialFilters = {
    providerName: "",
    usedAfter: "",
    client: "",
    clientSex: "",
    clientYob: "",
    clientPlaceOfLiving: "",
  };
  const currencySymbol = localStorage.getItem("currency_symbol");
  const { t } = useTranslation("campaign-details");
  const queryClient = useQueryClient();

  const [data, setData] = useState(campaignData || {});
  const { data: couponsData, isLoading } = useGetCouponsData(campaignId);
  const [dataToDisplay, setDataToDisplay] = useState(couponsData);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState(initialFilters);

  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (data) {
      setIsActive(data.active);
    }
  }, [data]);

  useEffect(() => {
    if (couponsData) {
      setData((prevData) => {
        return {
          ...prevData,
          usedBudget: couponsData.length * prevData.couponPrice,
          usedCoupons: couponsData.length,
        };
      });
      setDataToDisplay(couponsData);
    }
  }, [couponsData]);

  const tableRows = useMemo(() => {
    return [
      { label: "№", isCentered: true },
      { label: t("provider"), sortingKey: "providerName" },
      { label: t("client"), sortingKey: "clientName" },
      { label: t("client_sex"), sortingKey: "clientSex", isCentered: true },
      {
        label: t("client_yob"),
        sortingKey: "clientYob",
        isNumbered: true,
        isCentered: true,
      },
      {
        label: t("client_place_of_living"),
        sortingKey: "clientPlaceOfLiving",
        isCentered: true,
      },
      { label: t("used_on"), sortingKey: "createdAt", isDate: true },
    ];
  }, []);

  const getTableRowsData = useCallback(() => {
    return dataToDisplay?.map((coupon, index) => {
      return [
        <p className="text centered">{index + 1}</p>,
        <p className="text">{coupon.providerName}</p>,
        <p className="text">{coupon.clientName}</p>,
        <p className="text centered">{t(coupon.clientSex)}</p>,
        <p className="text centered">{coupon.clientYob}</p>,
        <p className="text centered">{t(coupon.clientPlaceOfLiving)}</p>,
        <p className="text">{getDateView(coupon.createdAt)}</p>,
      ];
    });
  }, [dataToDisplay]);

  const onSuccess = (data) => {
    toast(t(data.active ? "campaign_activated" : "campaign_deactivated"));
    queryClient.invalidateQueries({ queryKey: ["sponsor-data", sponsorId] });
    queryClient.invalidateQueries({ queryKey: ["campaign-data", campaignId] });
  };
  const onError = () => {
    toast(t("update_error"), { type: "error" });
    setIsActive(data.active);
  };
  const updateCampaignMutation = useUpdateCampaignData(onSuccess, onError);

  const handleChangeCampaignStatus = () => {
    setIsActive(!isActive);
    updateCampaignMutation.mutate({
      ...data,
      active: !isActive,
    });
  };

  // Create a CSV file with the data of the coupons
  // And download it
  const handleExportReport = () => {
    let csv = `${tableRows
      .slice(1)
      .map((x) => x.label)
      .join(",")}\n`;
    dataToDisplay.forEach((c) => {
      csv += `${c.providerName},${c.clientName},${t(c.clientSex)},${
        c.clientYob
      },${c.clientPlaceOfLiving},${getDateView(c.createdAt)}\n`;
    });

    const reportDate = new Date().toISOString().split("T")[0];
    const fileName = `coupons-report-${campaign}-${reportDate}.csv`;
    downloadCSVFile(csv, fileName);
  };

  // Create an array of unique provider names to display in the filter dropdown
  const providerNames = useMemo(() => {
    const names = Array.from(
      new Set(couponsData?.map((x) => x.providerName))
    ).map((x) => ({ value: x, label: x }));
    names.unshift({ value: "all", label: t("all") });
    return names;
  }, [couponsData]);

  // Create an array of unique client names to display in the filter dropdown
  const clientNames = useMemo(() => {
    const names = Array.from(
      new Set(couponsData?.map((x) => x.clientName))
    ).map((x) => ({ value: x, label: x }));
    names.unshift({ value: "all", label: t("all") });
    return names;
  }, [couponsData]);

  const clientSexOptions = [
    { label: t("male"), value: "male" },
    { label: t("female"), value: "female" },
    { label: t("unspecified"), value: "unspecified" },
    { label: t("not_mentioned"), value: "notMentioned" },
  ];

  const clientAgeOptions = useGetCountryAges();

  const clientPlaceOfLivingOptions = [
    { label: t("urban"), value: "urban" },
    { label: t("rural"), value: "rural" },
  ];

  const handleFilterSave = () => {
    // Check if the provider name is matching
    const filteredData = couponsData.filter((coupon) => {
      const isProviderNameMatching =
        filters.providerName === "all" ||
        !filters.providerName ||
        coupon.providerName === filters.providerName;

      const isClientNameMatching =
        filters.clientName === "all" || !filters.clientName
          ? true
          : coupon.clientName === filters.clientName;

      const isClientSexMatching =
        !filters.clientSex || coupon.clientSex === filters.clientSex;

      const isClientAgeMatching =
        !filters.clientYob || coupon.clientYob === filters.clientYob;

      const isClientPlaceOfLivingMatching =
        !filters.clientPlaceOfLiving ||
        coupon.clientPlaceOfLiving === filters.clientPlaceOfLiving;

      // Check if the date of creation of the coupon
      // is after the date selected by the admin
      const isStartDateMatching =
        !filters.usedAfter ||
        new Date(coupon.createdAt) >=
          new Date(new Date(filters.usedAfter).setHours(0, 0, 0));

      const isEndDateMatching =
        !filters.endDate ||
        new Date(new Date(coupon.createdAt).setHours(0, 0, 0)) <=
          new Date(filters.endDate);

      return (
        isProviderNameMatching &&
        isStartDateMatching &&
        isEndDateMatching &&
        isClientNameMatching &&
        isClientSexMatching &&
        isClientAgeMatching &&
        isClientPlaceOfLivingMatching
      );
    });
    setDataToDisplay(filteredData);
    setIsFilterModalOpen(false);
  };

  const handleFilterReset = () => {
    setFilters(initialFilters);
    setIsFilterModalOpen(false);
    setDataToDisplay(couponsData);
  };

  return (
    <Block classes="campaign-details">
      <Grid classes="campaign-details__grid">
        <GridItem md={8} lg={12}>
          <Box classes="campaign-details__box">
            <Grid classes="campaign-details__box__grid">
              <GridItem md={8} lg={12}>
                <div className="campaign-details__grid__activate-campaign">
                  <Toggle
                    isToggled={isActive}
                    setParentState={(toggled) =>
                      handleChangeCampaignStatus(toggled)
                    }
                  />
                  <p>
                    {t(isActive ? "deactivate_campaign" : "activate_campaign")}
                  </p>
                </div>
              </GridItem>
              {fieldsToDisplay.map((field, index) => {
                const fieldLabel = t(pascalToSnakeCase(field));
                const showCurrencySymbol = [
                  "usedBudget",
                  "budget",
                  "couponPrice",
                ].includes(field);
                return (
                  <GridItem md={2} lg={3} key={index}>
                    <p>
                      {fieldLabel}:{" "}
                      <strong>
                        {field.includes("Date")
                          ? getDateView(data[field])
                          : data[field]}
                        {showCurrencySymbol ? currencySymbol : ""}
                      </strong>
                    </p>
                  </GridItem>
                );
              })}
            </Grid>
          </Box>
        </GridItem>
      </Grid>
      {isLoading ? (
        <Loading />
      ) : (
        <BaseTable
          data={dataToDisplay}
          rows={tableRows}
          rowsData={getTableRowsData()}
          hasMenu={false}
          updateData={setDataToDisplay}
          hasSearch
          buttonLabel={t("export_report")}
          buttonAction={handleExportReport}
          secondaryButtonLabel={t("filter")}
          secondaryButtonAction={() => setIsFilterModalOpen(true)}
          t={t}
        />
      )}
      <Modal
        isOpen={isFilterModalOpen}
        closeModal={() => setIsFilterModalOpen(false)}
        heading={t("filter")}
        classes="campaign-details__filter-modal"
      >
        <DropdownWithLabel
          options={providerNames}
          selected={filters.providerName}
          label={t("provider")}
          setSelected={(value) =>
            setFilters({ ...filters, providerName: value })
          }
        />
        <DropdownWithLabel
          options={clientNames}
          selected={filters.clientName}
          label={t("client")}
          setSelected={(value) => setFilters({ ...filters, clientName: value })}
        />
        <DropdownWithLabel
          options={clientSexOptions}
          selected={filters.clientSex}
          label={t("client_sex")}
          setSelected={(value) => setFilters({ ...filters, clientSex: value })}
        />
        <DropdownWithLabel
          options={clientAgeOptions}
          selected={filters.clientYob}
          label={t("client_yob")}
          setSelected={(value) => setFilters({ ...filters, clientYob: value })}
        />
        <DropdownWithLabel
          options={clientPlaceOfLivingOptions}
          selected={filters.clientPlaceOfLiving}
          label={t("client_place_of_living")}
          setSelected={(value) =>
            setFilters({ ...filters, clientPlaceOfLiving: value })
          }
        />
        <DateInput
          value={filters.startDate}
          label={t("start_date")}
          onChange={(e) =>
            setFilters({ ...filters, startDate: e.target.value })
          }
        />
        <DateInput
          value={filters.endDate}
          label={t("end_date")}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        />
        <Button
          classes="campaign-details__filter-modal__cta"
          label={t("apply_filter")}
          size="lg"
          onClick={handleFilterSave}
        />
        <Button
          classes="campaign-details__filter-modal__cta"
          label={t("reset_filter")}
          type="secondary"
          size="lg"
          onClick={handleFilterReset}
        />
      </Modal>
    </Block>
  );
};
