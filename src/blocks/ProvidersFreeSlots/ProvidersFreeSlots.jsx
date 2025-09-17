import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Joi from "joi";

import { Button, Block, DateInput } from "@USupport-components-library/src";
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

  const [data, setData] = useState({ startDate: "", endDate: "" });
  const [errors, setErrors] = useState({});

  const generateReportMutation = useGenerateProvidersFreeSlotsReport();

  const schema = Joi.object({
    startDate: Joi.string().required().label(t("start_date_error")),
    endDate: Joi.string().required().label(t("end_date_error")),
  });

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
