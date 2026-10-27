import { useQuery } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";

export const useGetConsultationProblemReport = (reportId) => {
  const getConsultationProblemReport = async () => {
    const { data } = await adminSvc.getConsultationProblemReport(reportId);
    const consultation = data.consultation;
    return {
      reportId: data.report_id,
      submittedAt: new Date(data.submitted_at),
      reporterType: data.reporter_type,
      timezone: data.timezone,
      clientName: data.client_name,
      providerName: data.provider_name,
      source: data.source,
      deviceType: data.device_type,
      browserName: data.browser_name,
      browserVersion: data.browser_version,
      osName: data.os_name,
      osVersion: data.os_version,
      appVersion: data.app_version,
      interfaceLanguage: data.interface_language,
      reporterTimezone: data.reporter_timezone,
      callContext: data.call_context,
      organizationName: data.organization?.name,
      campaignName: data.campaign?.name,
      sponsorName: data.campaign?.sponsor_name,
      consultation: {
        consultationId: consultation.consultation_id,
        clientDetailId: consultation.client_detail_id,
        providerDetailId: consultation.provider_detail_id,
        time: new Date(consultation.time),
        status: consultation.status,
        durationMinutes: consultation.duration_minutes,
        createdAt: consultation.created_at,
        updatedAt: consultation.updated_at,
        bookedFrom: consultation.booked_from,
        clientJoinTime: consultation.client_join_time,
        clientLeaveTime: consultation.client_leave_time,
        providerJoinTime: consultation.provider_join_time,
        providerLeaveTime: consultation.provider_leave_time,
        canceledBy: consultation.canceled_by,
        canceledAt: consultation.canceled_at,
      },
    };
  };

  return useQuery(
    ["consultation-problem-report", reportId],
    getConsultationProblemReport,
    {
      enabled: !!reportId,
    }
  );
};
