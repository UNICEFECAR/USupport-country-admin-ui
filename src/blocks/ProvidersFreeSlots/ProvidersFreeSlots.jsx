import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Joi from "joi";

import {
  Button,
  Block,
  DateInput,
  DropdownWithLabel,
} from "@USupport-components-library/src";
import { validate } from "@USupport-components-library/utils";
import { useGenerateProvidersFreeSlotsReport } from "#hooks";

import "./providers-free-slots.scss";

/**
 * ProvidersFreeSlots
 *
 * ProvidersFreeSlots block
 *
 * @return {jsx}
 */
export const ProvidersFreeSlots = () => {
  const { t } = useTranslation("blocks", { keyPrefix: "providers-free-slots" });

  const [data, setData] = useState({
    startDate: "",
    endDate: "",
    startTime: "00",
    endTime: "23",
  });
  const [errors, setErrors] = useState({});

  const generateReportMutation = useGenerateProvidersFreeSlotsReport();

  const schema = Joi.object({
    startDate: Joi.string().required().label(t("start_date_error")),
    endDate: Joi.string().required().label(t("end_date_error")),
    startTime: Joi.string().required().label(t("start_time_error")),
    endTime: Joi.string().required().label(t("end_time_error")),
  });

  const timeOptions = Array.from({ length: 24 }, (_, i) => ({
    label: `${i.toString().padStart(2, "0")}:00`,
    value: i.toString().padStart(2, "0"),
  }));

  const endTimeOptions = timeOptions.filter(
    (option) => parseInt(option.value) >= parseInt(data.startTime)
  );

  const handleGenerateReport = async () => {
    if ((await validate(data, schema, setErrors)) === null) {
      if (
        data.startDate &&
        data.endDate &&
        new Date(data.endDate) < new Date(data.startDate)
      ) {
        setErrors({ endDate: t("end_date_before_start_error") });
        return;
      }

      if (
        data.startTime &&
        data.endTime &&
        parseInt(data.endTime) < parseInt(data.startTime)
      ) {
        setErrors({ endTime: t("end_time_before_start_error") });
        return;
      }

      await generateReportMutation.mutateAsync(data);
    }
  };

  return (
    <Block classes="providers-free-slots">
      <div className="providers-free-slots__description-container">
        <h4 className="providers-free-slots__heading">{t("heading")}</h4>
        <p className="text">{t("description")}</p>
      </div>
      <div className="providers-free-slots__date-inputs-container">
        <DateInput
          label={t("start_date")}
          onChange={(e) => setData({ ...data, startDate: e.target.value })}
          value={data.startDate}
          errorMessage={errors.startDate}
        />
        <DateInput
          label={t("end_date")}
          onChange={(e) => setData({ ...data, endDate: e.target.value })}
          value={data.endDate}
          errorMessage={errors.endDate}
        />
      </div>
      <div className="providers-free-slots__time-inputs-container">
        <DropdownWithLabel
          label={t("start_time")}
          options={timeOptions}
          selected={data.startTime}
          setSelected={(value) => setData({ ...data, startTime: value })}
          placeholder={t("start_time")}
          errorMessage={errors.startTime}
        />
        <DropdownWithLabel
          label={t("end_time")}
          options={endTimeOptions}
          selected={data.endTime}
          setSelected={(value) => setData({ ...data, endTime: value })}
          placeholder={t("end_time")}
          errorMessage={errors.endTime}
        />
      </div>
      <div className="providers-free-slots__btn-container">
        <Button
          onClick={handleGenerateReport}
          color="purple"
          size="md"
          loading={generateReportMutation.isLoading}
        >
          {t("generate_report")}
        </Button>
      </div>
    </Block>
  );
};
