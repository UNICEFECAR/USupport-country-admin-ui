import { useQuery } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";

const isRomaniaAdmin = () => localStorage.getItem("country") === "RO";

export const useGetOrganizationReports = () => {
  const fetchReports = async () => {
    const { data } = await adminSvc.getOrganizationReports();
    return data.map((item) => ({
      organizationReportId: item.organization_report_id,
      organizationId: item.organization_id,
      organizationName: item.organization_name,
      reason: item.reason ?? "",
      createdAt: new Date(item.created_at),
    }));
  };

  return useQuery(["organization-reports"], fetchReports, {
    enabled: isRomaniaAdmin(),
  });
};
