import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";

import {
  BaseTable,
  TabsUnderlined,
  Block,
  Grid,
  GridItem,
  Statistic,
  Loading,
  DropdownWithLabel,
} from "@USupport-components-library/src";
import { useWindowDimensions } from "@USupport-components-library/src/utils";
import { downloadCSVFile } from "@USupport-components-library/utils";
import { useGetContentStatistics, useGetPlatformMetrics } from "#hooks";

import "./analytics.scss";

/**
 * Analytics
 *
 * Analytics block
 *
 * @return {jsx}
 */
export const Analytics = () => {
  const { t, i18n } = useTranslation("blocks", { keyPrefix: "analytics" });
  const { width } = useWindowDimensions();

  const [selectedContentType, setSelectedContentType] = useState("all");
  const [options, setOptions] = useState([
    { label: t("content"), value: "content", isSelected: true },
    { label: t("general"), value: "general", isSelected: false },
  ]);

  const contentTypeOptions = [
    { label: t("all"), value: "all" },
    { label: t("articles"), value: "articles" },
    { label: t("videos"), value: "videos" },
    { label: t("podcasts"), value: "podcasts" },
  ];

  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useGetContentStatistics(selectedContentType);

  const shouldFetchPlatformMetrics =
    options.find((opt) => opt.value === "general")?.isSelected || false;

  const {
    data: generalPlatformMetrics,
    isLoading: isGeneralPlatformMetricsLoading,
    isError: isGeneralPlatfromMetricsError,
  } = useGetPlatformMetrics(shouldFetchPlatformMetrics);

  const [dataToDisplay, setDataToDisplay] = useState([]);

  useEffect(() => {
    if (categoriesData) {
      setDataToDisplay(categoriesData);
    }
  }, [categoriesData]);

  const handleTabSelect = (index) => {
    const optionsCopy = [...options];

    optionsCopy.forEach((option) => {
      option.isSelected = false;
    });

    optionsCopy[index].isSelected = !optionsCopy[index].isSelected;

    setOptions(optionsCopy);
  };

  const updateData = (sortedData) => {
    setDataToDisplay(sortedData);
  };

  const columns = useMemo(() => {
    return [
      { label: t("category_name"), sortingKey: "categoryName" },
      {
        label: t("engagement_score"),
        sortingKey: "engagementScore",
        isNumbered: true,
        isCentered: true,
      },
      {
        label: t("avg_rating"),
        sortingKey: "avgRating",
        isNumbered: true,
        isCentered: true,
      },
      {
        label: t("views"),
        sortingKey: "totalViews",
        isNumbered: true,
        isCentered: true,
      },
      {
        label: t("likes"),
        sortingKey: "likes",
        isNumbered: true,
        isCentered: true,
      },
      {
        label: t("dislikes"),
        sortingKey: "dislikes",
        isNumbered: true,
        isCentered: true,
      },
      {
        label: t("downloads"),
        sortingKey: "totalDownloads",
        isNumbered: true,
        isCentered: true,
      },

      {
        label: t("share_count"),
        sortingKey: "totalShares",
        isNumbered: true,
        isCentered: true,
      },
    ];
  }, [i18n.language]);

  const handleExport = () => {
    let csv = "";
    csv += columns.map((x) => x.label).join(",");

    dataToDisplay.forEach((row) => {
      csv += "\n";
      csv += `"${row.categoryName}",`;
      csv += `${row.engagementScore?.toFixed(2)},`;
      csv += `${row.avgRating?.toFixed(1)},`;
      csv += `${row.views},`;
      csv += `${row.likes},`;
      csv += `${row.dislikes},`;
      csv += `${row.downloads},`;
      csv += `${row.shares}`;
    });

    const reportDate = new Date().toISOString().split("T")[0];
    const fileName = `analytics-content-${reportDate}.csv`;
    downloadCSVFile(csv, fileName);
  };

  const rowsData = dataToDisplay?.map((item, index) => {
    return [
      <p key={`categoryName-${index}`} className="text">
        {item.categoryName}
      </p>,
      <p key={`engagementScore-${index}`} className="text centered">
        {item.engagementScore?.toFixed(2)}
      </p>,
      <p key={`avgRating-${index}`} className="text centered">
        {item.avgRating?.toFixed(1)}
      </p>,
      <p key={`views-${index}`} className="text centered">
        {item.views?.toLocaleString()}
      </p>,
      <p key={`likes-${index}`} className="text centered">
        {item.likes?.toLocaleString()}
      </p>,
      <p key={`dislikes-${index}`} className="text centered">
        {item.dislikes?.toLocaleString()}
      </p>,
      <p key={`downloads-${index}`} className="text centered">
        {item.downloads?.toLocaleString()}
      </p>,
      <p key={`shareCount-${index}`} className="text centered">
        {item.shares?.toLocaleString()}
      </p>,
    ];
  });

  const renderStatistic = () => {
    if (isGeneralPlatformMetricsLoading) {
      return (
        <Grid md={8} lg={12} classes="analytics__statistics-grid">
          <GridItem md={8} lg={12}>
            <Loading />
          </GridItem>
        </Grid>
      );
    }

    if (isGeneralPlatfromMetricsError || !generalPlatformMetrics) {
      return (
        <Grid md={8} lg={12} classes="analytics__statistics-grid">
          <GridItem md={8} lg={12}>
            <p>{t("no_data_found")}</p>
          </GridItem>
        </Grid>
      );
    }

    const statistics = Object.entries(generalPlatformMetrics).map(
      ([key, value]) => ({
        type: key,
        value:
          typeof value === "string" && !isNaN(Number(value))
            ? Number(value).toLocaleString()
            : typeof value === "number"
            ? value.toLocaleString()
            : String(value),
      })
    );

    return (
      <Grid md={8} lg={12} classes="analytics__statistics-grid">
        {statistics.map((statistic, index) => (
          <GridItem
            md={4}
            lg={4}
            key={index}
            classes="analytics__statistics-item"
          >
            <Statistic
              textBold={statistic.value}
              text={t(statistic.type)}
              orientation={"landscape"}
              hasIcon={false}
            />
          </GridItem>
        ))}
      </Grid>
    );
  };

  const handleSearch = (searchTerm) => {
    const filteredData = dataToDisplay.filter((item) =>
      item.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setDataToDisplay(filteredData);
  };

  const handleContentTypeSelect = (value) => {
    console.log(value);
    setSelectedContentType(value);
  };

  return (
    <Block classes="analytics">
      <TabsUnderlined options={options} handleSelect={handleTabSelect} t={t} />
      {options[0].isSelected ? (
        <React.Fragment>
          <DropdownWithLabel
            classes="analytics__dropdown"
            options={contentTypeOptions}
            selected={selectedContentType}
            setSelected={handleContentTypeSelect}
            t={t}
            label={t("content_type")}
          />
          <BaseTable
            data={dataToDisplay}
            rows={columns}
            rowsData={rowsData}
            updateData={updateData}
            t={t}
            hasMenu={false}
            hasSearch
            customSearch={handleSearch}
            buttonLabel={t("export_label")}
            buttonAction={handleExport}
          />
        </React.Fragment>
      ) : (
        renderStatistic()
      )}
    </Block>
  );
};
