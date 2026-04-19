import type { ReqURL } from "~/models/url/req/req-create-url";
import type { AxiosInstance } from "axios";

export function useUrls() {
    const { $api } = useNuxtApp() as unknown as { $api: AxiosInstance };

    const createUrl = async (create: ReqURL) => {
       const response = await $api.post("/api/urls/create", create);
       return response.data;
    };

    return {
      createUrl,
    };
}