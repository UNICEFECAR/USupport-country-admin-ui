import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";

import {
  BaseTable,
  Button,
  ButtonWithIcon,
  TabsUnderlined,
  Block,
  Grid,
  GridItem,
  Loading,
  DropdownWithLabel,
  ReportCollapsible,
  Box,
  Label,
  Icon,
} from "@USupport-components-library/src";
import { downloadCSVFile } from "@USupport-components-library/utils";
import { useGetContentStatistics, useGetPlatformMetrics } from "#hooks";
import { FilterAnalytics } from "#backdrops";

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
  const queryClient = useQueryClient();

  const [selectedContentType, setSelectedContentType] = useState("all");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    sex: "",
    urbanRural: "",
    yearOfBirth: "",
  });
  const [options, setOptions] = useState([
    { label: t("general"), value: "general", isSelected: true },
    { label: t("content"), value: "content", isSelected: false },
  ]);

  const contentTypeOptions = [
    { label: t("all"), value: "all" },
    { label: t("articles"), value: "articles" },
    { label: t("videos"), value: "videos" },
    { label: t("podcasts"), value: "podcasts" },
  ];

  const filtersToTranslaate = ["sex", "urbanRural", "yearOfBirth"];

  const { data: categoriesData, isFetching: isCategoriesDataFetching } =
    useGetContentStatistics({
      contentType: selectedContentType,
      sex: filters.sex || null,
      yearOfBirth: filters.yearOfBirth || null,
      urbanRural: filters.urbanRural || null,
      startDate: filters.startDate || null,
      endDate: filters.endDate || null,
    });

  const shouldFetchPlatformMetrics =
    options.find((opt) => opt.value === "general")?.isSelected || false;

  const {
    data: generalPlatformMetrics,
    isLoading: isGeneralPlatformMetricsLoading,
    isFetching: isGeneralPlatformMetricsFetching,
    isError: isGeneralPlatfromMetricsError,
  } = useGetPlatformMetrics({
    startDate: filters.startDate || null,
    endDate: filters.endDate || null,
    sex: filters.sex || null,
    urbanRural: filters.urbanRural || null,
    yearOfBirth: filters.yearOfBirth || null,
    enabled: shouldFetchPlatformMetrics,
  });

  const [dataToDisplay, setDataToDisplay] = useState([]);
  const [originalData, setOriginalData] = useState([]); // Add original data reference

  useEffect(() => {
    if (categoriesData) {
      setDataToDisplay(categoriesData);
      setOriginalData(categoriesData); // Store original data
    }
  }, [categoriesData]);

  const handleTabSelect = (index) => {
    const optionsCopy = [...options];

    optionsCopy.forEach((option) => {
      option.isSelected = false;
    });

    optionsCopy[index].isSelected = !optionsCopy[index].isSelected;

    setFilters({
      startDate: "",
      endDate: "",
      sex: "",
      urbanRural: "",
      yearOfBirth: "",
    });

    setOptions(optionsCopy);
  };

  const updateData = (sortedData) => {
    setDataToDisplay(sortedData);
    // When data is sorted, update the original data reference as well
    setOriginalData(sortedData);
  };

  const columns = useMemo(() => {
    return [
      { label: t("category_name"), sortingKey: "categoryName" },
      {
        label: t("engagement_score"),
        sortingKey: "engagementScore",
        isNumbered: true,
        isCentered: true,
        headerTooltip: t("engagement_score_tooltip"),
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
      <p
        key={`engagementScore-${index}`}
        className="text centered"
        title={t("engagement_score_tooltip")}
      >
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

  const consultationKeys = [
    "totalConsultations",
    "consultationsJoinedByClientAndProvider",

    "clientsAttendedConsultations",
    "scheduledConsultations",
    "mobileScheduledConsultations",
    "cancelledConsultations",
    "lateCancelledConsultations",
    "totalCouponConsultations",
  ];

  const visitKeys = [
    "globalWebsiteVisits",
    "uniqueWebsiteAccess",
    "totalWebsiteAccess",
    "uniqueWebsiteAccess",
    "totalClientAccess",
    "uniqueClientAccess",
    "totalProviderAccess",
    "uniqueProviderAccess",
    "totalMobileAccess",
    "uniqueMobileAccess",
  ];

  const clicksKeys = [
    "emailRegisterClick",
    "mobileEmailRegisterClick",
    "anonymousRegisterClick",
    "mobileAnonymousRegisterClick",
    "guestRegisterClick",
    "mobileGuestRegisterClick",
    "joinConsultationClick",
    "mobileJoinConsultationClick",
    "scheduleButtonClick",
    "mobileScheduleButtonClick",
  ];

  const userKeys = [
    "totalProviders",
    "activeProviders",
    "allClients",
    "activeClients",
    "positiveClientRatings",
  ];
  const renderStatistic = () => {
    if (isGeneralPlatformMetricsLoading) {
      return (
        <Grid classes="analytics__statistics-grid">
          <GridItem md={8} lg={12}>
            <Loading />
          </GridItem>
        </Grid>
      );
    }

    if (isGeneralPlatfromMetricsError || !generalPlatformMetrics) {
      return (
        <Grid classes="analytics__statistics-grid">
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
        ...value,
      })
    );

    const consultationStatistics = statistics
      .filter((statistic) => consultationKeys.includes(statistic.type))
      .sort((a, b) => {
        const indexA = consultationKeys.indexOf(a.type);
        const indexB = consultationKeys.indexOf(b.type);
        return indexA - indexB;
      });

    const visitStatistics = statistics.filter((statistic) =>
      visitKeys.includes(statistic.type)
    );

    const clicksStatistics = statistics.filter((statistic) =>
      clicksKeys.includes(statistic.type)
    );

    const userStatistics = statistics.filter((statistic) =>
      userKeys.includes(statistic.type)
    );

    const renderStatistic = (statistic, index) => {
      return (
        <GridItem
          md={8}
          lg={
            statistic.type === "globalWebsiteVisits" ||
            statistic.type === "totalConsultations"
              ? 12
              : 6
          }
          key={index}
          classes="analytics__statistics-item"
        >
          <ReportCollapsible
            canCollapse={!!statistic.demographics}
            headingItems={[
              <>
                <p>
                  {t(statistic.type)}
                  {"  "}
                  <strong>
                    {isNaN(statistic.count) ? statistic.value : statistic.count}
                  </strong>
                  {statistic.uniqueCount ? (
                    <span>
                      {" / "}
                      {t(`${statistic.type}_unique_count`)}
                      {"  "}
                      <strong>{statistic.uniqueCount}</strong>
                    </span>
                  ) : null}
                </p>
              </>,
            ]}
            contentHeading={
              statistic.demographics ? (
                <h4>{t("demographics_breakdown")}</h4>
              ) : null
            }
            classes="analytics__statistics-collapsible"
            headingText={t(`${statistic.type}_info`)}
          >
            <div className="analytics__statistics-content">
              {Object.entries(statistic?.demographics || {}).map(([key]) => {
                return (
                  <div>
                    <h4 className="analytics__statistics-content__heading">
                      {t(key)}
                    </h4>
                    <div className="analytics__statistics-content__type">
                      {Object.entries(statistic?.demographics[key] || {}).map(
                        ([key, value]) => {
                          return (
                            <div
                              className="analytics__statistics-content__type__item"
                              key={key}
                            >
                              <p className="analytics__statistics-content__type__item__text">
                                {isNaN(key) ? t(key) : key}:{" "}
                                <strong>{value}</strong>
                              </p>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ReportCollapsible>
        </GridItem>
      );
    };

    return (
      <div className="analytics-content">
        <Box classes="analytics__statistics-box">
          <h3>{t("consultations")}</h3>
          <Grid classes="analytics__statistics-grid">
            {consultationStatistics.map((statistic, index) =>
              renderStatistic(statistic, index)
            )}
          </Grid>
        </Box>
        <Box classes="analytics__statistics-box">
          <h3>{t("visits")}</h3>
          <Grid classes="analytics__statistics-grid">
            {visitStatistics.map((statistic, index) =>
              renderStatistic(statistic, index)
            )}
          </Grid>
        </Box>
        <Box classes="analytics__statistics-box">
          <h3>{t("button_clicks")}</h3>
          {filters.sex || filters.urbanRural || filters.yearOfBirth ? (
            <div className="analytics__statistics-box__disclaimer">
              <Icon color="#eb5757" name="exclamation-mark" />
              <p>{t("data_cannot_be_filtered")}</p>
            </div>
          ) : null}
          <Grid classes="analytics__statistics-grid">
            {clicksStatistics.map((statistic, index) =>
              renderStatistic(statistic, index)
            )}
          </Grid>
        </Box>
        <Box classes="analytics__statistics-box">
          <h3>{t("users")}</h3>
          <Grid classes="analytics__statistics-grid">
            {userStatistics.map((statistic, index) =>
              renderStatistic(statistic, index)
            )}
          </Grid>
        </Box>
      </div>
    );
  };

  const handleSearch = (searchTerm) => {
    if (!searchTerm || searchTerm.trim() === "") {
      setDataToDisplay(originalData);
    } else {
      const filteredData = originalData.filter((item) =>
        item.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setDataToDisplay(filteredData);
    }
  };

  const handleContentTypeSelect = (value) => {
    setSelectedContentType(value);
  };

  const handleOpenFilterModal = () => {
    setIsFilterModalOpen(true);
  };

  const handleCloseFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      sex: "",
      urbanRural: "",
      yearOfBirth: "",
    });
  };

  const handleRemoveFilter = (filter) => {
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters };
      delete newFilters[filter];
      return newFilters;
    });
  };

  const handleRefreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["all-categories-statistics"] });
    queryClient.invalidateQueries({ queryKey: ["platform-metrics"] });
  };

  return (
    <Block classes="analytics">
      <FilterAnalytics
        isOpen={isFilterModalOpen}
        handleClose={handleCloseFilterModal}
        filters={filters}
        handleApplyFilters={handleApplyFilters}
        handleResetFilters={handleResetFilters}
      />
      <TabsUnderlined options={options} handleSelect={handleTabSelect} t={t} />
      <ButtonWithIcon
        classes="analytics__refresh-button"
        iconName="refresh"
        label={t("refresh")}
        iconColor="#ffffff"
        iconSize="sm"
        onClick={handleRefreshData}
      />
      {options[1].isSelected ? (
        <React.Fragment>
          <Grid md={8} lg={12} classes="analytics__filters-grid">
            <GridItem
              md={2}
              lg={3}
              classes="analytics__filters-grid__dropdown-container"
            >
              <DropdownWithLabel
                classes="analytics__dropdown"
                options={contentTypeOptions}
                selected={selectedContentType}
                setSelected={handleContentTypeSelect}
                t={t}
                label={t("content_type")}
              />
            </GridItem>
          </Grid>
          <BaseTable
            isLoading={isCategoriesDataFetching}
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
            secondaryButtonLabel={t("filters")}
            secondaryButtonAction={handleOpenFilterModal}
            filters={Object.keys(filters).reduce((acc, key) => {
              if (!filters[key]) return acc;
              acc[key] = filtersToTranslaate.includes(key)
                ? t(filters[key])
                : filters[key];
              return acc;
            }, {})}
            handleRemoveFilter={handleRemoveFilter}
            enableTooltips={true}
          />
        </React.Fragment>
      ) : (
        <React.Fragment>
          {
            <div className="analytics__filters-container">
              <div>
                <Button
                  classes="analytics__filter-button"
                  color="purple"
                  onClick={handleOpenFilterModal}
                >
                  {t("filters")}
                </Button>
              </div>
              <div className="analytics__active-filters">
                {filters.startDate && (
                  <Label
                    showRemove
                    text={`${t("start_date")}: ${filters.startDate}`}
                    onRemove={() => handleRemoveFilter("startDate")}
                  />
                )}
                {filters.endDate && (
                  <Label
                    showRemove
                    text={`${t("end_date")}: ${filters.endDate}`}
                    onRemove={() => handleRemoveFilter("endDate")}
                  />
                )}
                {filters.sex && (
                  <Label
                    showRemove
                    text={`${t("sex_label")}: ${t(`sex_${filters.sex}`)}`}
                    onRemove={() => handleRemoveFilter("sex")}
                  />
                )}
                {filters.urbanRural && (
                  <Label
                    showRemove
                    text={`${t("place_of_living_label")}: ${t(
                      `place_of_living_${filters.urbanRural}`
                    )}`}
                    onRemove={() => handleRemoveFilter("urbanRural")}
                  />
                )}
                {filters.yearOfBirth && (
                  <Label
                    showRemove
                    text={`${t("year_of_birth_label")}: ${filters.yearOfBirth}`}
                    onRemove={() => handleRemoveFilter("yearOfBirth")}
                  />
                )}
              </div>
            </div>
          }
          <div className="analytics__statistics-wrapper">
            {isGeneralPlatformMetricsFetching &&
              !isGeneralPlatformMetricsLoading && (
                <div className="analytics__loading-overlay">
                  <Loading />
                </div>
              )}
            {renderStatistic()}
          </div>
        </React.Fragment>
      )}
    </Block>
  );
};
