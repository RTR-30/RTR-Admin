import axios from "axios";
import { FestivalCampaignsApi } from "../../../../environment/apimanager";
import { rtrToken } from "../../../Common/HttpService/headers";

export type AppType = "user" | "partner" | "all";

export type AllowedIconKey =
    | "normal"
    | "pongal"
    | "puthandu"
    | "vinayagar"
    | "navaratri"
    | "deepavali"
    | "karthigai_deepam"
    | "christmas"
    | "holi"
    | "krishnajanmashtami"
    | "valentineday"
    | "newyear"
    | "rakshabandhan"
    | "ramzan"
    | "republicday";

export interface FestivalCampaign {
    id: number;
    festival_name: string;
    icon_key: AllowedIconKey;
    app_type: AppType;
    start_at: string;
    end_at: string;
    enabled: boolean | number;
    created_at?: string;
    updated_at?: string;
}

export interface CreateCampaignPayload {
    festival_name: string;
    icon_key: AllowedIconKey;
    app_type: AppType;
    start_at: string;
    end_at: string;
    enabled?: boolean;
}

export interface IconMeta {
    key: AllowedIconKey;
    label: string;
    badgeColor: string;
    badgeBg: string;
    accentColor: string;
    category: string;
}

export const FESTIVAL_ICON_OPTIONS: IconMeta[] = [
    { key: "normal", label: "Default Branding", badgeColor: "#475569", badgeBg: "#F1F5F9", accentColor: "#64748B", category: "Standard" },
    { key: "pongal", label: "Pongal", badgeColor: "#D97706", badgeBg: "#FEF3C7", accentColor: "#F59E0B", category: "Harvest" },
    { key: "deepavali", label: "Deepavali", badgeColor: "#B45309", badgeBg: "#FFFBEB", accentColor: "#F59E0B", category: "Lights" },
    { key: "christmas", label: "Christmas", badgeColor: "#DC2626", badgeBg: "#FEE2E2", accentColor: "#EF4444", category: "Winter" },
    { key: "newyear", label: "New Year", badgeColor: "#7C3AED", badgeBg: "#EDE9FE", accentColor: "#8B5CF6", category: "Celebration" },
    { key: "holi", label: "Holi", badgeColor: "#DB2777", badgeBg: "#FCE7F3", accentColor: "#EC4899", category: "Colors" },
    { key: "krishnajanmashtami", label: "Krishna Janmashtami", badgeColor: "#2563EB", badgeBg: "#DBEAFE", accentColor: "#3B82F6", category: "Devotional" },
    { key: "valentineday", label: "Valentine's Day", badgeColor: "#E11D48", badgeBg: "#FFE4E6", accentColor: "#F43F5E", category: "Occasion" },
    { key: "rakshabandhan", label: "Raksha Bandhan", badgeColor: "#0D9488", badgeBg: "#CCFBF1", accentColor: "#14B8A6", category: "Bonding" },
    { key: "ramzan", label: "Ramzan", badgeColor: "#059669", badgeBg: "#D1FAE5", accentColor: "#10B981", category: "Sacred" },
    { key: "republicday", label: "Republic Day", badgeColor: "#EA580C", badgeBg: "#FFEDD5", accentColor: "#F97316", category: "National" },
    { key: "puthandu", label: "Tamil New Year", badgeColor: "#C2410C", badgeBg: "#FFEDD5", accentColor: "#EA580C", category: "Cultural" },
    { key: "vinayagar", label: "Vinayagar Chaturthi", badgeColor: "#B45309", badgeBg: "#FEF3C7", accentColor: "#F59E0B", category: "Devotional" },
    { key: "navaratri", label: "Navaratri", badgeColor: "#9333EA", badgeBg: "#F3E8FF", accentColor: "#A855F7", category: "Festive" },
    { key: "karthigai_deepam", label: "Karthigai Deepam", badgeColor: "#EA580C", badgeBg: "#FFF7ED", accentColor: "#F97316", category: "Lights" },
];

export const getIconMeta = (key: string): IconMeta => {
    return (
        FESTIVAL_ICON_OPTIONS.find((item) => item.key === key) || {
            key: "normal" as AllowedIconKey,
            label: key || "Default Branding",
            badgeColor: "#475569",
            badgeBg: "#F1F5F9",
            accentColor: "#64748B",
            category: "Standard",
        }
    );
};

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    message?: string;
    isConflict?: boolean;
    conflictMessage?: string;
}

/**
 * Fetch list of festival campaigns from admin endpoint
 */
export const GetFestivalCampaignsService = async (params: {
    page?: number;
    limit?: number;
    app_type?: string;
    search?: string;
    enabled?: boolean;
} = {}): Promise<ApiResponse<FestivalCampaign[]>> => {
    try {
        const headers = await rtrToken();
        const res = await axios.get(FestivalCampaignsApi, {
            headers,
            params,
        });

        const rawData = res.data;
        const list: FestivalCampaign[] = Array.isArray(rawData?.data)
            ? rawData.data
            : Array.isArray(rawData)
            ? rawData
            : [];

        return {
            success: true,
            data: list,
            pagination: rawData?.pagination,
            message: rawData?.message || "Campaigns fetched successfully",
        };
    } catch (error: any) {
        console.error("Failed to fetch festival campaigns:", error);
        return {
            success: false,
            data: [],
            message: error?.response?.data?.message || error?.message || "Failed to load campaigns",
        };
    }
};

/**
 * Create a new festival campaign (supports 409 conflict detection and override)
 */
export const CreateFestivalCampaignService = async (
    payload: CreateCampaignPayload,
    allowOverlap: boolean = false
): Promise<ApiResponse<FestivalCampaign>> => {
    try {
        const headers = await rtrToken();
        const url = allowOverlap ? `${FestivalCampaignsApi}?allowOverlap=true` : FestivalCampaignsApi;

        const res = await axios.post(url, payload, { headers });
        return {
            success: true,
            data: res.data?.data,
            message: res.data?.message || "Festival campaign created successfully",
        };
    } catch (error: any) {
        if (error.response && error.response.status === 409) {
            return {
                success: false,
                isConflict: true,
                conflictMessage:
                    error.response.data?.message ||
                    "This campaign collides with an existing campaign. Would you like to override?",
            };
        }
        return {
            success: false,
            message: error.response?.data?.message || error.message || "Failed to create campaign",
        };
    }
};

/**
 * Update an existing festival campaign
 */
export const UpdateFestivalCampaignService = async (
    id: number | string,
    payload: Partial<CreateCampaignPayload>,
    allowOverlap: boolean = false
): Promise<ApiResponse<FestivalCampaign>> => {
    try {
        const headers = await rtrToken();
        const url = allowOverlap ? `${FestivalCampaignsApi}/${id}?allowOverlap=true` : `${FestivalCampaignsApi}/${id}`;

        const res = await axios.put(url, payload, { headers });
        return {
            success: true,
            data: res.data?.data,
            message: res.data?.message || "Festival campaign updated successfully",
        };
    } catch (error: any) {
        if (error.response && error.response.status === 409) {
            return {
                success: false,
                isConflict: true,
                conflictMessage:
                    error.response.data?.message ||
                    "This campaign collides with an existing campaign. Would you like to override?",
            };
        }
        return {
            success: false,
            message: error.response?.data?.message || error.message || "Failed to update campaign",
        };
    }
};

/**
 * Delete a festival campaign
 */
export const DeleteFestivalCampaignService = async (id: number | string): Promise<ApiResponse<void>> => {
    try {
        const headers = await rtrToken();
        const res = await axios.delete(`${FestivalCampaignsApi}/${id}`, { headers });
        return {
            success: true,
            message: res.data?.message || "Festival campaign deleted successfully",
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || error.message || "Failed to delete campaign",
        };
    }
};
