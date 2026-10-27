import { useQuery } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";

export const useGetConsultationProblemReports = (filters) => {
  const getConsultationProblemReports = async () => {
    const { data } = await adminSvc.getConsultationProblemReports(filters);
    return {
      total: data.total,
      page: data.page,
      pageSize: data.pageSize,
      timezone: data.timezone,
      reports: data.reports.map((report) => ({
        reportId: report.report_id,
        submittedAt: new Date(report.submitted_at),
        reporterType: report.reporter_type,
        reporterName: report.reporter_name,
        source: report.source,
        deviceType: report.device_type,
        consultationTime: new Date(report.time),
      })),
    };
  };

  return useQuery(
    ["consultation-problem-reports", filters],
    getConsultationProblemReports,
    {
      keepPreviousData: true,
    }
  );
};
