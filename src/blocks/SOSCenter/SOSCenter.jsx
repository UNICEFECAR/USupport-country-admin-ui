import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Block,
  Grid,
  GridItem,
  SOSCenterRow,
  Loading,
  Error as ErrorComponent,
} from "@USupport-components-library/src";
import { useTranslation } from "react-i18next";

import { cmsSvc, adminSvc } from "@USupport-components-library/services";
import { filterAdminData } from "@USupport-components-library/utils";
import { useError } from "#hooks";

import "./sos-center.scss";

/**
 * SOSCenter
 *
 * SOSCenter block
 *
 * @return {jsx}
 */
export const SOSCenter = () => {
  const queryClient = useQueryClient();
  const { i18n, t } = useTranslation("sos-center");

  const [error, setError] = useState();

  //--------------------- SOS Centers ----------------------//
  const getSOSCenters = async () => {
    // Request SOS centers ids from the master DB
    const sosCentersIds = await adminSvc.getSOSCenters();

    let { data } = await cmsSvc.getSOSCenters({
      locale: i18n.language,
      ids: sosCentersIds,
      isForAdmin: true,
    });

    const filteredData = filterAdminData(data.data, data.meta.localizedIds);

    return filteredData;
  };

  const {
    data: SOSCentersData,
    isLoading: SOSCentersLoading,
    isFetched: isSOSCentersFetched,
  } = useQuery(["SOSCenters", i18n.language], getSOSCenters);

  const handleSelectSOSCenter = async (id, newValue, index) => {
    let newData = JSON.parse(JSON.stringify(SOSCentersData));
    newData[index].isSelected = newValue;

    updateSOSCentersMutation.mutate({
      id: id.toString(),
      newValue,
      sosCenterData: newData,
    });
  };

  const updateSOSCenters = async (data) => {
    const sosCenterAvailableLocales = await cmsSvc.getSOSCenterAvailableLocales(
      data.id
    );
    let res;
    if (data.newValue === true) {
      res = await adminSvc.putSOSCenters(
        sosCenterAvailableLocales.en.toString()
      );
    } else {
      res = await adminSvc.deleteSOSCenters(
        sosCenterAvailableLocales.en.toString()
      );
    }
    return res.data;
  };

  const updateSOSCentersMutation = useMutation(updateSOSCenters, {
    onMutate: (data) => {
      const oldData = queryClient.getQueryData(["SOSCenters", i18n.language]);

      // Perform an optimistic update to the UI
      queryClient.setQueryData(
        ["SOSCenters", i18n.language],
        data.sosCenterData
      );

      return () => {
        queryClient.setQueryData(["SOSCenters", i18n.language], oldData);
      };
    },
    onSuccess: (data) => {},
    onError: (error, variables, rollback) => {
      const { message: errorMessage } = useError(error);
      setError(errorMessage);
      rollback();
    },
  });

  return (
    <Block classes="sos-center">
      <Grid>
        <GridItem md={8} lg={12} classes="sos-center__rows">
          {isSOSCentersFetched &&
            SOSCentersData &&
            SOSCentersData.map((sosCenter, index) => {
              return (
                <SOSCenterRow
                  selected={sosCenter.isSelected}
                  setSelected={() =>
                    handleSelectSOSCenter(
                      sosCenter.id,
                      !sosCenter.isSelected,
                      index
                    )
                  }
                  heading={sosCenter.attributes.title}
                  text={sosCenter.attributes.text}
                  link={sosCenter.attributes.url}
                  phone={sosCenter.attributes.phone}
                  key={index}
                />
              );
            })}
          {!SOSCentersData?.length && SOSCentersLoading && <Loading />}
          {!SOSCentersData?.length &&
            !SOSCentersLoading &&
            isSOSCentersFetched && (
              <h3 className="sos-center__no-results">{t("no_results")}</h3>
            )}
          {error ? <ErrorComponent message={error} /> : null}
        </GridItem>
      </Grid>
    </Block>
  );
};
