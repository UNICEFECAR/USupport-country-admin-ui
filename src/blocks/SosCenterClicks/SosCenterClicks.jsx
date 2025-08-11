import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import { useGetSOSCenterClicks } from "#hooks";

import {
  Block,
  Loading,
  ReportCollapsible,
} from "@USupport-components-library/src";
import {
  getDateView,
  getTimeFromDate,
} from "@USupport-components-library/utils";
import { cmsSvc } from "@USupport-components-library/services";

import "./sos-center-clicks.scss";

/**
 * SosCenterClicks
 *
 * SosCenterClicks block
 *
 * @return {jsx}
 */
export const SosCenterClicks = () => {
  const { t, i18n } = useTranslation("blocks", {
    keyPrefix: "sos-center-clicks",
  });

  const { data, isLoading } = useGetSOSCenterClicks();

  const sosCenterIds = data?.clicksByCenter.reduce((acc, curr) => {
    if (curr.sosCenterId) {
      acc.push(Number(curr.sosCenterId));
    }
    return acc;
  }, []);

  const sosCenterData = useQuery({
    queryKey: ["sosCenterData", sosCenterIds],
    queryFn: () =>
      cmsSvc.getSOSCenters({
        ids: sosCenterIds,
        populate: true,
        locale: "en",
      }),
  });

  console.log(sosCenterData.data?.data?.data);

  const sosCenterNames = sosCenterData.data?.data?.data?.map((sosCenter) => {
    let name = sosCenter.attributes.text;
    if (i18n.language !== "en") {
      const currentLocalization = sosCenter.attributes.localizations.data.find(
        (x) => x.attributes.locale === i18n.language
      );
      console.log(currentLocalization);
      if (currentLocalization) {
        name = currentLocalization.attributes.text;
      }
    }
    return {
      id: sosCenter.id,
      name,
    };
  });

  return (
    <Block classes="sos-center-clicks">
      {isLoading ? (
        <Loading />
      ) : (
        <div>
          {data?.clicksByCenter?.map((sosCenter, index) => {
            console.log(sosCenter);
            const { web, client } = sosCenter.platformBreakdown;
            const sosCenterName = sosCenter.isMain
              ? { name: t("floating_button") }
              : sosCenterNames?.find((x) => x.id === sosCenter.sosCenterId) ||
                "";
            return (
              <ReportCollapsible
                key={"sos-center" + index}
                headingItems={[
                  <p>
                    {t("sos_center")}: {sosCenterName.name}
                  </p>,
                  <p>
                    {t("click_count")}: {sosCenter.clickCount}
                  </p>,
                  <p>
                    {t("web")}: {web || 0}
                  </p>,
                  <p>
                    {t("client")}: {client || 0}
                  </p>,
                ]}
                contentHeading={t("history")}
              >
                <div className="sos-center-clicks__content">
                  {sosCenter.timestamps.map((timestamp, index) => {
                    const date = getDateView(timestamp.timestamp);
                    const time = getTimeFromDate(new Date(timestamp.timestamp));

                    return (
                      <p key={`clicked-at-${index}`}>
                        {t("clicked_at", {
                          time: `${date} - ${time}`,
                          platform: t(timestamp.platform),
                        })}
                      </p>
                    );
                  })}
                </div>
              </ReportCollapsible>
            );
          })}
        </div>
      )}
    </Block>
  );
};
