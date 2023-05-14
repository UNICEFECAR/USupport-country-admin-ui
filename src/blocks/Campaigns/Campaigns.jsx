import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  Block,
  BaseTable,
  Button,
  Grid,
  GridItem,
  Loading,
  Input,
  Modal,
  Box,
} from "@USupport-components-library/src";

import { useGetAllSponsorsData } from "#hooks";

const AMAZON_S3_BUCKET = `${import.meta.env.VITE_AMAZON_S3_BUCKET}`;

import "./campaigns.scss";

/**
 * Campaigns
 *
 * Campaigns block
 *
 * @return {jsx}
 */
export const Campaigns = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("campaigns");
  const rows = useMemo(() => {
    return [
      { label: t("sponsor"), sortingKey: "sponsorName" },
      {
        label: t("campaigns"),
        sortingKey: "totalCampaigns",
        isNumbered: true,
        isCentered: true,
      },
      {
        label: t("active_campaigns"),
        sortingKey: "activeCampaigns",
        isNumbered: true,
        isCentered: true,
      },
      { label: t("email"), sortingKey: "email" },
      { label: t("phone"), sortingKey: "phone" },
    ];
  }, [i18n.language]);

  const [filterData, setFilterData] = useState({
    minTotalCampaigns: 0,
    minActiveCampaigns: 0,
  });

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const { data, isLoading } = useGetAllSponsorsData();
  const [dataToDisplay, setDataToDisplay] = useState(data);

  useEffect(() => {
    if (data) {
      setDataToDisplay(data);
    }
  }, [data]);

  const rowsData = dataToDisplay?.map((item, index) => {
    return [
      <div key={"item" + index} className="campaigns__sponsor">
        <img
          className="campaigns__sponsor__image"
          src={AMAZON_S3_BUCKET + (`/${item.image}` || "default")}
        />
        <p className="text campaigns__sponsor__name">{item.sponsorName}</p>
      </div>,
      <p className="text centered">{item.totalCampaigns}</p>,
      <p className="text centered">{item.activeCampaigns}</p>,
      <p className="text">{item.email}</p>,
      <p className="text">{item.phone}</p>,
    ];
  });

  const menuOptions = [
    {
      icon: "view",
      text: t("view"),
      handleClick: (id) => navigate(`/sponsor-details?sponsorId=${id}`),
    },
    {
      icon: "edit",
      text: t("edit"),
      handleClick: (id) => navigate(`/edit-sponsor?sponsorId=${id}`),
    },
  ];

  const reduceCampaigns = useCallback(
    (array, key) => {
      let sum = 0;
      array?.forEach((item) => {
        const amount = Number(item[key]);
        if (amount) {
          sum += amount;
        }
      });

      return sum;
    },
    [data]
  );

  const handleFilterSave = () => {
    let dataCopy = [...data];
    dataCopy = dataCopy.filter((x) => {
      const isMinTotalMatching =
        Number(x.totalCampaigns) >= Number(filterData.minTotalCampaigns);
      const isMinActiveMatching =
        Number(x.activeCampaigns) >= Number(filterData.minActiveCampaigns);
      return isMinTotalMatching && isMinActiveMatching ? true : false;
    });
    setDataToDisplay(dataCopy);
    setIsFilterModalOpen(false);
  };

  const handleFilterReset = () => {
    setFilterData({
      minTotalCampaigns: 0,
      minActiveCampaigns: 0,
    });
    setDataToDisplay(data);
    setIsFilterModalOpen(false);
  };

  return (
    <Block classes="campaigns">
      <Grid classes="campaigns__grid">
        <GridItem md={8} lg={12}>
          <Box classes="campaigns__box" boxShadow={2}>
            <Grid classes="campaigns__box__grid">
              <GridItem xs={4} md={2} lg={4}>
                <p>
                  {t("sponsors")}: <strong>{data?.length}</strong>
                </p>
              </GridItem>
              <GridItem xs={4} md={3} lg={4}>
                <p>
                  {t("campaigns")}:{" "}
                  <strong>{reduceCampaigns(data, "totalCampaigns")}</strong>
                </p>
              </GridItem>
              <GridItem xs={4} md={3} lg={4}>
                <p>
                  {t("active_campaigns")}:{" "}
                  <strong>{reduceCampaigns(data, "activeCampaigns")}</strong>
                </p>
              </GridItem>
            </Grid>
          </Box>
        </GridItem>
      </Grid>

      {isLoading ? (
        <Loading />
      ) : (
        <BaseTable
          data={dataToDisplay}
          rows={rows}
          rowsData={rowsData}
          menuOptions={menuOptions}
          handleClickPropName={"sponsorId"}
          updateData={setDataToDisplay}
          hasSearch
          buttonLabel={t("add_button")}
          buttonAction={() => navigate("/add-sponsor")}
          secondaryButtonLabel={t("filter_button")}
          secondaryButtonAction={() => setIsFilterModalOpen(true)}
          t={t}
        />
      )}

      <Modal
        isOpen={isFilterModalOpen}
        closeModal={() => setIsFilterModalOpen(false)}
        heading={t("filter_heading")}
        classes="campaigns__filter-modal"
      >
        <Input
          label={t("min_total_campaigns")}
          value={filterData.minTotalCampaigns}
          onChange={(e) => {
            console.log(e.target.value, "e");
            setFilterData((prev) => ({
              ...prev,
              minTotalCampaigns: e.target.value,
            }));
          }}
        />
        <Input
          label={t("min_active_campaigns")}
          value={filterData.minActiveCampaigns}
          onChange={(e) =>
            setFilterData((prev) => ({
              ...prev,
              minActiveCampaigns: e.target.value,
            }))
          }
        />
        <Button
          label={t("apply_filter")}
          classes="campaigns__filter-modal__cta"
          size="lg"
          onClick={handleFilterSave}
        />
        <Button
          label={t("reset_filter")}
          classes="campaigns__filter-modal__cta"
          size="lg"
          type="secondary"
          onClick={handleFilterReset}
        />
      </Modal>
    </Block>
  );
};
