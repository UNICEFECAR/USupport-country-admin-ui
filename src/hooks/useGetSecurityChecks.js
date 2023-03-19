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
          contactsDisclosure: item.contacts_disclosure,
          suggestOutsideMeeting: item.suggest_outside_meeting,
          identityCoercion: item.identity_coercion,
          unsafeFeeling: item.unsafe_feeling,
          moreDetails: item.more_details,
        },
        providerName: `${providerData.name} ${providerData.patronym} ${providerData.surname}`,
        providerDetailId: item.provider_detail_id,
        clientName: item.clientName,
        consultationTime: new Date(item.time),
        numberOfIssues: Object.values(item).filter((x) => x === true).length,
      };
      finalData.push(finalItem);
    });
    return finalData;
  };

  return useQuery(["securityChecks"], getSecurityChecks);
};
