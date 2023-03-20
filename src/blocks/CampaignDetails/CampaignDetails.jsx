import React, { useCallback, useState, useEffect } from "react";
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
} from "@USupport-components-library/src";

import {
  pascalToSnakeCase,
  getDateView,
  downloadCSVFile,
} from "@USupport-components-library/utils";

import { useGetCouponsData, useUpdateCampaignData } from "#hooks";

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

  const tableRows = ["№", t("provider"), t("used_on")];

  const getTableRowsData = useCallback(() => {
    return dataToDisplay?.map((coupon, index) => {
      return [
        <p>{index + 1}</p>,
        <p>{coupon.providerName}</p>,
        <p>{getDateView(coupon.createdAt)}</p>,
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
    let csv = `${t("provider")},${t("used_on")}\n"`;
    couponsData.forEach((c) => {
      csv += `${c.providerName},${getDateView(c.createdAt)}\n`;
    });

    const reportDate = new Date().toISOString().split("T")[0];
    const fileName = `coupons-report-${campaign}-${reportDate}.csv`;
    downloadCSVFile(csv, fileName);
  };

  // Create an array of unique provider names to display in the filter dropdown
  const providerNames = useCallback(() => {
    const names = Array.from(
      new Set(couponsData?.map((x) => x.providerName))
    ).map((x) => ({ value: x, label: x }));
    return names;
  }, [couponsData]);

  const handleFilterSave = () => {
    // Check if the provider name is matching
    const filteredData = couponsData.filter((coupon) => {
      const isProviderNameIncluded =
        !filters.providerName || coupon.providerName === filters.providerName;

      // Check if the date of creation of the coupon
      // is after the date selected by the admin
      const isUsedAfter =
        !filters.usedAfter ||
        new Date(coupon.createdAt) >= new Date(filters.usedAfter);
      return isProviderNameIncluded && isUsedAfter;
    });
    setDataToDisplay(filteredData);
    setIsFilterModalOpen(false);
  };

  const handleFilterReset = () => {
    setFilters(initialFilters);
    setIsFilterModalOpen(false);
  };

  return (
    <Block classes="campaign-details">
      <Grid classes="campaign-details__grid">
        <GridItem md={8} lg={12}>
          <div className="campaign-details__buttons-container">
            <Button
              label={t("filter")}
              type="secondary"
              color="purple"
              size="md"
              onClick={() => setIsFilterModalOpen(true)}
            />
            <Button
              label={t("export_report")}
              color="purple"
              size="md"
              onClick={handleExportReport}
            />
          </div>
        </GridItem>

        <>
          <GridItem md={8} lg={12}>
            <div className="campaign-details__grid__activate-campaign">
              <Toggle
                isToggled={isActive}
                setParentState={(toggled) =>
                  handleChangeCampaignStatus(toggled)
                }
              />
              <p>{t(isActive ? "deactivate_campaign" : "activate_campaign")}</p>
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
        </>
      </Grid>
      {isLoading ? (
        <Loading />
      ) : (
        <BaseTable
          rows={tableRows}
          rowsData={getTableRowsData()}
          hasMenu={false}
          t={t}
        />
      )}
      <Modal
        isOpen={isFilterModalOpen}
        handleClose={() => setIsFilterModalOpen(false)}
        heading={t("filter")}
        classes="campaign-details__filter-modal"
      >
        <DropdownWithLabel
          options={providerNames()}
          selected={filters.providerName}
          label={t("provider")}
          setSelected={(value) =>
            setFilters({ ...filters, providerName: value })
          }
        />
        <DateInput
          value={filters.usedAfter}
          label={t("used_after")}
          onChange={(e) =>
            setFilters({ ...filters, usedAfter: e.currentTarget.value })
          }
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
          size="lg"
          onClick={handleFilterReset}
        />
      </Modal>
    </Block>
  );
};
