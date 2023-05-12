import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminSvc } from "@USupport-components-library/services";

export default function useGetAdminData() {
  const [adminData, setAdminData] = useState();
  const fetchData = async () => {
    const { data } = await adminSvc.getData();
    data.adminId = data.admin_id;

    delete data.admin_id;
    delete data.is_active;
    delete data.password;
    return data;
  };
  const adminDataQuery = useQuery(["admin-data"], fetchData, {
    onSuccess: (data) => {
      const dataCopy = JSON.parse(JSON.stringify(data));
      setAdminData({ ...dataCopy });
    },
    notifyOnChangeProps: ["admin-data"],
  });

  return [adminDataQuery, adminData, setAdminData];
}

export { useGetAdminData };
