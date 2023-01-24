import { useQuery } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";

export const useGetContactForms = () => {
  const getContactForms = async () => {
    const { data } = await adminSvc.getContactForms();
    return data.map((item) => {
      return {
        sender: item.email,
        subject: item.subject,
        message: item.message,
        createdAt: new Date(item.created_at),
      };
    });
  };

  return useQuery(["contact-forms"], getContactForms);
};
