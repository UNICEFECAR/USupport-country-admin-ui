import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";

import {
  BaseTable,
  TabsUnderlined,
  Block,
  Grid,
  GridItem,
  Statistic,
} from "@USupport-components-library/src";
import { useWindowDimensions } from "@USupport-components-library/src/utils";
import { downloadCSVFile } from "@USupport-components-library/utils";

import "./analytics.scss";

const initialData = [
  {
    categoryName: "Category 1",
    views: 12345,
    downloads: 5678,
    avgRating: 4.5,
    shareCount: 2345,
    engagementScore: 85,
  },
  {
    categoryName: "Category 2",
    views: 10234,
    downloads: 4567,
    avgRating: 4.2,
    shareCount: 1890,
    engagementScore: 78,
  },
  {
    categoryName: "Category 3",
    views: 8765,
    downloads: 4321,
    avgRating: 4.8,
    shareCount: 3456,
    engagementScore: 90,
  },
  {
    categoryName: "Category 4",
    views: 6543,
    downloads: 3210,
    avgRating: 4.1,
    shareCount: 2109,
    engagementScore: 82,
  },
  {
    categoryName: "Category 5",
    views: 5432,
    downloads: 2109,
    avgRating: 4.6,
    shareCount: 1234,
    engagementScore: 88,
  },
  {
    categoryName: "Category 6",
    views: 4321,
    downloads: 1098,
    avgRating: 4.3,
    shareCount: 987,
    engagementScore: 80,
  },
  {
    categoryName: "Category 7",
    views: 3210,
    downloads: 876,
    avgRating: 4.7,
    shareCount: 654,
    engagementScore: 92,
  },
  {
    categoryName: "Category 8",
    views: 2109,
    downloads: 765,
    avgRating: 4.4,
    shareCount: 543,
    engagementScore: 84,
  },
  {
    categoryName: "Category 9",
    views: 1098,
    downloads: 654,
    avgRating: 4.9,
    shareCount: 432,
    engagementScore: 95,
  },
  {
    categoryName: "Category 10",
    views: 876,
    downloads: 543,
    avgRating: 4.0,
    shareCount: 321,
    engagementScore: 76,
  },
  {
    categoryName: "Category 11",
    views: 765,
    downloads: 432,
    avgRating: 4.5,
    shareCount: 210,
    engagementScore: 89,
  },
  {
    categoryName: "Category 12",
    views: 654,
    downloads: 321,
    avgRating: 4.2,
    shareCount: 109,
    engagementScore: 81,
  },
  {
    categoryName: "Category 13",
    views: 543,
    downloads: 210,
    avgRating: 4.6,
    shareCount: 98,
    engagementScore: 87,
  },
];

const generalMatrics = {
  totalUsers: 123456,
  activeUsers: 78901,
  newUsers: 12345,
  userRetention: 65,
};

/**
 * Analytics
 *
 * Analytics block
 *
 * @return {jsx}
 */
export const Analytics = () => {
  const { t, i18n } = useTranslation("analytics");
  const { width } = useWindowDimensions();

  const [options, setOptions] = useState([
    { label: t("content"), value: "content", isSelected: true },
    { label: t("general"), value: "general", isSelected: false },
  ]);

  const [dataToDisplay, setDataToDisplay] = useState(initialData);

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
        label: t("views"),
        sortingKey: "views",
        isNumbered: true,
        isCentered: true,
      },
      {
        label: t("downloads"),
        sortingKey: "downloads",
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
        label: t("share_count"),
        sortingKey: "shareCount",
        isNumbered: true,
        isCentered: true,
      },
      {
        label: t("engagement_score"),
        sortingKey: "engagementScore",
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
      csv += `${row.views},`;
      csv += `${row.downloads},`;
      csv += `${row.avgRating.toFixed(1)},`;
      csv += `${row.shareCount},`;
      csv += `${row.engagementScore}`;
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
      <p key={`views-${index}`} className="text centered">
        {item.views.toLocaleString()}
      </p>,
      <p key={`downloads-${index}`} className="text centered">
        {item.downloads.toLocaleString()}
      </p>,
      <p key={`avgRating-${index}`} className="text centered">
        {item.avgRating.toFixed(1)}
      </p>,
      <p key={`shareCount-${index}`} className="text centered">
        {item.shareCount.toLocaleString()}
      </p>,
      <p key={`engagementScore-${index}`} className="text centered">
        {item.engagementScore}
      </p>,
    ];
  });

  const renderStatistic = () => {
    const statistics = [
      {
        type: "total_users",
        value: generalMatrics.totalUsers.toLocaleString(),
        iconName: "community",
      },
      {
        type: "active_users",
        value: generalMatrics.activeUsers.toLocaleString(),
        iconName: "community",
      },
      {
        type: "new_users",
        value: generalMatrics.newUsers.toLocaleString(),
        iconName: "community",
      },
      {
        type: "user_retention",
        value: `${generalMatrics.userRetention}%`,
        iconName: "community",
      },
    ];

    return (
      <Grid md={8} lg={12} classes="analytics__statistics-grid">
        {statistics.map((statistic, index) => (
          <GridItem
            md={4}
            lg={3}
            key={index}
            classes="analytics__statistics-item"
          >
            <Statistic
              textBold={statistic.value}
              text={t(statistic.type)}
              iconName={statistic.iconName}
              orientation={width > 768 ? "portrait" : "landscape"}
            />
          </GridItem>
        ))}
      </Grid>
    );
  };

  const handleSearch = (searchTerm) => {
    const filteredData = initialData.filter((item) =>
      item.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setDataToDisplay(filteredData);
  };

  return (
    <Block classes="analytics">
      <TabsUnderlined options={options} handleSelect={handleTabSelect} t={t} />
      {options[0].isSelected ? (
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
      ) : (
        renderStatistic()
      )}
    </Block>
  );
};
