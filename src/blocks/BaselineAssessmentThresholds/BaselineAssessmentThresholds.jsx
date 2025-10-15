import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import {
  useGetBaselineAssessmentThresholds,
  useUpdateBaselineAssessmentThreshold,
  useGetBaselineAssessmentAnalysis,
} from "#hooks";

import {
  Block,
  Box,
  Input,
  DateInput,
  Button,
  Loading,
} from "@USupport-components-library/src";

import { getDateView } from "@USupport-components-library/utils";

import "./baseline-assessment-thresholds.scss";

/**
 * BaselineAssessmentThresholds
 *
 * Block for managing baseline assessment thresholds
 *
 * @return {jsx}
 */
export const BaselineAssessmentThresholds = () => {
  const { t } = useTranslation("blocks", {
    keyPrefix: "baseline-assessment-thresholds",
  });

  const [editingId, setEditingId] = useState(null);
  const [filterData, setFilterData] = useState({
    startDate: "",
    endDate: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: null,
    endDate: null,
  });

  const { data: thresholds, isLoading } = useGetBaselineAssessmentThresholds();
  const {
    data: analysisData,
    isLoading: isAnalysisLoading,
    error: analysisError,
  } = useGetBaselineAssessmentAnalysis({
    startDate: appliedFilters.startDate,
    endDate: appliedFilters.endDate,
  });

  const onUpdateSuccess = () => {
    toast.success(t("update_success"));
    setEditingId(null);
  };

  const onUpdateError = (error) => {
    const errorMessage = error ? error : t("update_error");
    toast.error(errorMessage);
  };

  const updateMutation = useUpdateBaselineAssessmentThreshold(
    onUpdateSuccess,
    onUpdateError
  );

  const handleEdit = (threshold) => {
    setEditingId(threshold.baselineAssesmentThresholdId || threshold.id);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleSave = (threshold, newData) => {
    const payload = {
      id: threshold.baselineAssesmentThresholdId || threshold.id,
      factor: threshold.factor, // Keep original factor, don't allow changes
      below: parseInt(newData.below),
      above: parseInt(newData.above),
    };

    updateMutation.mutate(payload);
  };

  const handleFilterChange = (field, value) => {
    setAppliedFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setFilterData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilterData({ startDate: "", endDate: "" });
    setAppliedFilters({ startDate: null, endDate: null });
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Block classes="baseline-assessment-thresholds">
      <div className="baseline-assessment-thresholds__container">
        <div className="baseline-assessment-thresholds__header">
          <h3>{t("title")}</h3>
          <p>{t("description")}</p>
        </div>

        <div className="baseline-assessment-thresholds__list">
          {thresholds?.map((threshold) => (
            <ThresholdRow
              key={threshold.baselineAssesmentThresholdId || threshold.id}
              threshold={threshold}
              isEditing={
                editingId ===
                (threshold.baselineAssesmentThresholdId || threshold.id)
              }
              onEdit={handleEdit}
              onCancel={handleCancel}
              onSave={handleSave}
              isLoading={updateMutation.isMutating}
              t={t}
            />
          ))}
        </div>

        {/* Analysis Section */}
        <div className="baseline-assessment-thresholds__analysis">
          <div className="baseline-assessment-thresholds__analysis-header">
            <h3>{t("analysis_title")}</h3>
            <p>{t("analysis_description")}</p>
          </div>

          <div className="baseline-assessment-thresholds__analysis-filters">
            <div className="baseline-assessment-thresholds__analysis-filters-fields">
              <DateInput
                placeholder={t("select_start_date")}
                type="date"
                label={t("start_date")}
                value={filterData.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.currentTarget.value)
                }
                classes="baseline-assessment-thresholds__analysis-filter-input"
              />
              <DateInput
                placeholder={t("select_end_date")}
                type="date"
                label={t("end_date")}
                value={filterData.endDate}
                onChange={(e) =>
                  handleFilterChange("endDate", e.currentTarget.value)
                }
                classes="baseline-assessment-thresholds__analysis-filter-input"
              />
            </div>
            <div className="baseline-assessment-thresholds__analysis-filters-actions">
              <Button
                label={t("reset_filters")}
                size="sm"
                color="purple"
                onClick={handleResetFilters}
              />
            </div>
          </div>

          {isAnalysisLoading ? (
            <div className="baseline-assessment-thresholds__analysis-loading">
              <Loading size="md" />
            </div>
          ) : analysisError ? (
            <div className="baseline-assessment-thresholds__analysis-error">
              <p>{t("error_loading_analysis")}</p>
            </div>
          ) : analysisData?.totalAssessments === 0 ? (
            <div className="baseline-assessment-thresholds__analysis-no-data">
              <p>{t("no_data")}</p>
            </div>
          ) : (
            <AnalysisDisplay analysisData={analysisData} t={t} />
          )}
        </div>
      </div>
    </Block>
  );
};

/**
 * ThresholdRow component for individual threshold management
 */
const ThresholdRow = ({
  threshold,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  isLoading,
  t,
}) => {
  const [formData, setFormData] = useState({
    below: threshold.below,
    above: threshold.above,
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveClick = () => {
    // Validate that below < above
    if (parseInt(formData.below) >= parseInt(formData.above)) {
      toast.error(t("validation_error"));
      return;
    }
    onSave(threshold, formData);
  };

  return (
    <Box
      boxShadow="1"
      padding="md"
      classes="baseline-assessment-thresholds__row"
    >
      <div className="baseline-assessment-thresholds__row-content">
        <div className="baseline-assessment-thresholds__factor">
          <div className="baseline-assessment-thresholds__factor-display">
            <span className="baseline-assessment-thresholds__factor-value">
              {t(threshold.factor)}
            </span>
          </div>
        </div>

        <div className="baseline-assessment-thresholds__thresholds-row">
          <div className="baseline-assessment-thresholds__below">
            {isEditing ? (
              <Input
                label={t("below_label")}
                value={formData.below}
                onChange={(e) => handleInputChange("below", e.target.value)}
                type="number"
                min="0"
              />
            ) : (
              <div className="baseline-assessment-thresholds__value-display">
                <p className="text baseline-assessment-thresholds__value-label">
                  {t("below_label")}:
                </p>
                <span className="baseline-assessment-thresholds__value-number">
                  {threshold.below}
                </span>
              </div>
            )}
          </div>

          <div className="baseline-assessment-thresholds__above">
            {isEditing ? (
              <Input
                label={t("above_label")}
                value={formData.above}
                onChange={(e) => handleInputChange("above", e.target.value)}
                type="number"
                min="0"
              />
            ) : (
              <div className="baseline-assessment-thresholds__value-display">
                <p className="text baseline-assessment-thresholds__value-label">
                  {t("above_label")}:
                </p>
                <span className="baseline-assessment-thresholds__value-number">
                  {threshold.above}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="baseline-assessment-thresholds__actions">
          {isEditing ? (
            <div className="baseline-assessment-thresholds__edit-actions">
              <Button
                label={t("save")}
                size="sm"
                color="green"
                onClick={handleSaveClick}
                loading={isLoading}
                disabled={isLoading}
              />
              <Button
                label={t("cancel")}
                size="sm"
                type="secondary"
                onClick={onCancel}
                disabled={isLoading}
              />
            </div>
          ) : (
            <Button
              label={t("edit")}
              size="sm"
              color="green"
              onClick={() => onEdit(threshold)}
            />
          )}
        </div>
      </div>
    </Box>
  );
};

/**
 * AnalysisDisplay component for showing assessment analysis data
 */
const AnalysisDisplay = ({ analysisData, t }) => {
  const { totalAssessments, isSplit, analysis } = analysisData;

  const renderFactorAnalysis = (factorData, factorName) => (
    <Box
      borderSize="sm"
      boxShadow="1"
      padding="md"
      key={factorName}
      classes="baseline-assessment-thresholds__analysis-factor"
    >
      <div className="baseline-assessment-thresholds__analysis-factor-header">
        <span className="baseline-assessment-thresholds__factor-name">
          {t(factorName)}
        </span>
      </div>
      <div className="baseline-assessment-thresholds__analysis-factor-data">
        <div className="baseline-assessment-thresholds__median-display">
          <p className="baseline-assessment-thresholds__median-label">
            {t("median_value")}:
          </p>
          <p className="baseline-assessment-thresholds__median-value">
            {factorData.median?.toFixed(1) || "N/A"}
          </p>
        </div>

        <div className="baseline-assessment-thresholds__median-display">
          <p className="baseline-assessment-thresholds__median-label">
            {t("below_count")}:
          </p>
          <p
            className={`baseline-assessment-thresholds__median-value ${
              factorData.belowCount > 0
                ? "baseline-assessment-thresholds__median-value--risk"
                : ""
            }`}
          >
            {factorData.belowCount}
          </p>
        </div>

        <div className="baseline-assessment-thresholds__median-display">
          <p className="baseline-assessment-thresholds__median-label">
            {t("above_count")}:
          </p>
          <p
            className={`baseline-assessment-thresholds__median-value ${
              factorData.aboveCount > 0
                ? "baseline-assessment-thresholds__median-value--risk"
                : ""
            }`}
          >
            {factorData.aboveCount}
          </p>
        </div>

        <div className="baseline-assessment-thresholds__count-display">
          <span className="baseline-assessment-thresholds__count-label">
            {t("total_answers")}:
          </span>
          <span className="baseline-assessment-thresholds__count-value">
            {factorData.count}
          </span>
        </div>
      </div>
    </Box>
  );

  const renderGroupAnalysis = (groupData, groupName) => (
    <div className="baseline-assessment-thresholds__analysis-group">
      <h5 className="baseline-assessment-thresholds__group-title">
        {t(groupName)} ({groupData.count} assessments)
      </h5>
      <p className="baseline-assessment-thresholds__group-date">
        {getDateView(groupData.firstDate)} - {getDateView(groupData.lastDate)}
      </p>
      <div className="baseline-assessment-thresholds__analysis-factors">
        {renderFactorAnalysis(groupData.psychological, "psychological")}
        {renderFactorAnalysis(groupData.biological, "biological")}
        {renderFactorAnalysis(groupData.social, "social")}
      </div>
    </div>
  );

  return (
    <div className="baseline-assessment-thresholds__analysis-content">
      <div className="baseline-assessment-thresholds__analysis-summary">
        <Box
          borderSize="sm"
          boxShadow="1"
          padding="md"
          classes="baseline-assessment-thresholds__total-assessments"
        >
          <p className="baseline-assessment-thresholds__total-value">
            <span className="baseline-assessment-thresholds__total-label">
              {t("total_assessments")}:{" "}
            </span>
            {totalAssessments}
          </p>
        </Box>
        <Box
          borderSize="sm"
          boxShadow="1"
          padding="md"
          classes="baseline-assessment-thresholds__total-assessments"
        >
          <p className="baseline-assessment-thresholds__total-value">
            <span className="baseline-assessment-thresholds__total-label">
              {t("total_answers")}:{" "}
            </span>
            {totalAssessments * 27}
          </p>
        </Box>
      </div>

      {isSplit ? (
        <div className="baseline-assessment-thresholds__split-analysis">
          <div className="baseline-assessment-thresholds__groups">
            {renderGroupAnalysis(analysis.firstHalf, "first_half")}
            {renderGroupAnalysis(analysis.secondHalf, "second_half")}
          </div>
        </div>
      ) : (
        <div className="baseline-assessment-thresholds__single-analysis">
          <div className="baseline-assessment-thresholds__analysis-factors">
            {renderFactorAnalysis(analysis.psychological, "psychological")}
            {renderFactorAnalysis(analysis.biological, "biological")}
            {renderFactorAnalysis(analysis.social, "social")}
          </div>
        </div>
      )}
    </div>
  );
};
