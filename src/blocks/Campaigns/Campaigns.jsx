import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  Block,
  BaseTable,
  Button,
  Grid,
  GridItem,
  InputSearch,
  Loading,
  Input,
  Modal,
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
  const { t } = useTranslation("campaigns");
  const rows = [
    t("sponsor"),
    t("campaigns"),
    t("active_campaigns"),
    t("email"),
    t("phone"),
  ];

  const [searchValue, setSearchValue] = useState("");

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

  const rowsData = dataToDisplay
    ?.filter((x) =>
      x.sponsorName.toLowerCase().includes(searchValue.toLowerCase())
    )
    .map((item, index) => {
      return [
        <div key={"item" + index} className="campaigns__sponsor">
          <img
            className="campaigns__sponsor__image"
            src={AMAZON_S3_BUCKET + (`/${item.image}` || "default")}
          />
          <p className="text campaigns__sponsor__name">{item.sponsorName}</p>
        </div>,
        <p>{item.totalCampaigns}</p>,
        <p>{item.activeCampaigns}</p>,
        <p>{item.email}</p>,
        <p>
          {item.phonePrefix} {item.phone}
        </p>,
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
      const filtered = array?.filter(
        (x) => Number(x.totalCampaigns) && Number(x.activeCampaigns)
      );
      let sum = 0;
      filtered?.forEach((item) => {
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
  };

  return (
    <Block classes="campaigns">
      <div className="campaigns__buttons">
        <Button
          label={t("filter_button")}
          color="purple"
          type="secondary"
          onClick={() => setIsFilterModalOpen(true)}
        />
        <Button
          label={t("add_button")}
          color="purple"
          onClick={() => navigate("/add-sponsor")}
        />
      </div>

      <Grid classes="campaigns__information">
        <GridItem xs={4} md={2} lg={3}>
          <p>
            {t("sponsors")}: <strong>{data?.length}</strong>
          </p>
        </GridItem>
        <GridItem xs={4} md={2} lg={3}>
          <p>
            {t("campaigns")}:{" "}
            <strong>{reduceCampaigns(data, "totalCampaigns")}</strong>
          </p>
        </GridItem>
        <GridItem xs={4} md={2} lg={3}>
          <p>
            {t("active_campaigns")}:{" "}
            <strong>{reduceCampaigns(data, "activeCampaigns")}</strong>
          </p>
        </GridItem>
        <GridItem xs={4} md={8} lg={3}>
          <InputSearch
            placeholder={t("search")}
            value={searchValue}
            onChange={setSearchValue}
          />
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
