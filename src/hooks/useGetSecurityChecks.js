import { useQuery } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";

export const useGetSecurityChecks = () => {
  const getSecurityChecks = async () => {
    const { data } = await adminSvc.getSecurityChecks();
    const finalData = [];
    data.forEach((item) => {
      const providerData = item.providerData;
      const finalItem = {
        answers: {
          providerAttend: item.provider_attend,
          contactsDisclosure: item.contacts_disclosure,
          suggestOutsideMeeting: item.suggest_outside_meeting,
          identityCoercion: item.identity_coercion,
          unsafeFeeling: item.unsafe_feeling,
          moreDetails: item.more_details,
          feeling: item.feeling,
          addressedNeeds: item.addressed_needs,
          improveWellbeing: item.improve_wellbeing,
          feelingsNow: item.feelings_now,
          additionalComment: item.additional_comment,
        },
        providerName: `${providerData.name} ${providerData.patronym} ${providerData.surname}`,
        providerDetailId: item.provider_detail_id,
        clientName: item.clientName,
        consultationTime: new Date(item.time),
        numberOfIssues: Object.values(item).filter((x) => x === true).length,
        createdAt: item.created_at,
      };
      finalData.push(finalItem);
    });
    return finalData;
  };

  return useQuery(["securityChecks"], getSecurityChecks);
};
