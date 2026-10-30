import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Modal,
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    Switch,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

import Header from "../../../Common/PageHeader";
import { showSuccess, showError } from "../../../Common/ToastMessage";
import { COLORS, SHADOWS } from "../../../utils/ColorCode";
import {
    FestivalCampaign,
    CreateCampaignPayload,
    AllowedIconKey,
    AppType,
    FESTIVAL_ICON_OPTIONS,
    getIconMeta,
    GetFestivalCampaignsService,
    CreateFestivalCampaignService,
    UpdateFestivalCampaignService,
    DeleteFestivalCampaignService,
} from "./helper";

const FestivalCampaigns = () => {
    const navigation: any = useNavigation();

    // Data states
    const [campaigns, setCampaigns] = useState<FestivalCampaign[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedAppFilter, setSelectedAppFilter] = useState<"all_filter" | "user" | "partner" | "all">("all_filter");
    const [selectedStatusFilter, setSelectedStatusFilter] = useState<"all" | "active" | "disabled">("all");

    // Modal state for Create / Edit
    const [formModalVisible, setFormModalVisible] = useState<boolean>(false);
    const [editingCampaign, setEditingCampaign] = useState<FestivalCampaign | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);

    // Form fields
    const [formName, setFormName] = useState<string>("");
    const [formIconKey, setFormIconKey] = useState<AllowedIconKey>("pongal");
    const [formAppType, setFormAppType] = useState<AppType>("all");
    const [formStartAt, setFormStartAt] = useState<string>("");
    const [formEndAt, setFormEndAt] = useState<string>("");
    const [formEnabled, setFormEnabled] = useState<boolean>(true);
    const [formError, setFormError] = useState<string>("");

    // Conflict Overlap Warning Modal
    const [overlapModalVisible, setOverlapModalVisible] = useState<boolean>(false);
    const [overlapMessage, setOverlapMessage] = useState<string>("");
    const [pendingPayload, setPendingPayload] = useState<CreateCampaignPayload | null>(null);
    const [pendingCampaignId, setPendingCampaignId] = useState<number | string | null>(null);

    // Delete Modal
    const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
    const [campaignToDelete, setCampaignToDelete] = useState<FestivalCampaign | null>(null);
    const [deleting, setDeleting] = useState<boolean>(false);

    const loadCampaigns = async () => {
        try {
            const res = await GetFestivalCampaignsService();
            if (res.success && Array.isArray(res.data)) {
                setCampaigns(res.data);
            } else if (!res.success) {
                showError(res.message || "Failed to load festival campaigns");
            }
        } catch (err: any) {
            console.error("Load campaigns error:", err);
            showError("Network error while loading campaigns");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadCampaigns();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadCampaigns();
    }, []);

    // Summary statistics
    const stats = useMemo(() => {
        const now = new Date();
        let activeNow = 0;
        let upcoming = 0;
        let paused = 0;

        campaigns.forEach((c) => {
            const isEnabled = Boolean(c.enabled);
            const start = new Date(c.start_at);
            const end = new Date(c.end_at);

            if (!isEnabled) {
                paused++;
            } else if (now >= start && now <= end) {
                activeNow++;
            } else if (now < start) {
                upcoming++;
            }
        });

        return { total: campaigns.length, activeNow, upcoming, paused };
    }, [campaigns]);

    // Filtered list
    const filteredCampaigns = useMemo(() => {
        return campaigns.filter((item) => {
            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const matchName = item.festival_name?.toLowerCase().includes(q);
                const matchIcon = item.icon_key?.toLowerCase().includes(q);
                if (!matchName && !matchIcon) return false;
            }

            // App type filter
            if (selectedAppFilter !== "all_filter") {
                if (item.app_type !== selectedAppFilter) return false;
            }

            // Status filter
            if (selectedStatusFilter === "active" && !item.enabled) return false;
            if (selectedStatusFilter === "disabled" && item.enabled) return false;

            return true;
        });
    }, [campaigns, searchQuery, selectedAppFilter, selectedStatusFilter]);

    // Helpers to populate date presets
    const setPresetDates = (daysFromNow: number, durationDays: number) => {
        const start = new Date();
        start.setDate(start.getDate() + daysFromNow);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(end.getDate() + durationDays);
        end.setHours(23, 59, 59, 999);

        setFormStartAt(start.toISOString().slice(0, 16).replace("T", " "));
        setFormEndAt(end.toISOString().slice(0, 16).replace("T", " "));
    };

    const openCreateModal = () => {
        setEditingCampaign(null);
        setFormName("");
        setFormIconKey("pongal");
        setFormAppType("all");
        setFormEnabled(true);
        setFormError("");
        setPresetDates(0, 4); // Default: Today for 4 days
        setFormModalVisible(true);
    };

    const openEditModal = (campaign: FestivalCampaign) => {
        setEditingCampaign(campaign);
        setFormName(campaign.festival_name);
        setFormIconKey(campaign.icon_key);
        setFormAppType(campaign.app_type);
        setFormEnabled(Boolean(campaign.enabled));
        setFormError("");

        const formatForInput = (iso: string) => {
            try {
                const d = new Date(iso);
                return d.toISOString().slice(0, 16).replace("T", " ");
            } catch {
                return iso;
            }
        };

        setFormStartAt(formatForInput(campaign.start_at));
        setFormEndAt(formatForInput(campaign.end_at));
        setFormModalVisible(true);
    };

    const handleFormSubmit = async (allowOverlap: boolean = false) => {
        setFormError("");

        if (!formName.trim()) {
            setFormError("Please enter a festival campaign name.");
            return;
        }

        const parseToIso = (dateStr: string) => {
            const cleaned = dateStr.trim().replace(" ", "T");
            const d = new Date(cleaned);
            if (isNaN(d.getTime())) return null;
            return d.toISOString();
        };

        const isoStart = parseToIso(formStartAt);
        const isoEnd = parseToIso(formEndAt);

        if (!isoStart || !isoEnd) {
            setFormError("Invalid date/time format. Use YYYY-MM-DD HH:mm (e.g. 2027-01-14 00:00)");
            return;
        }

        if (new Date(isoEnd) <= new Date(isoStart)) {
            setFormError("End Date must be strictly after Start Date.");
            return;
        }

        const payload: CreateCampaignPayload = {
            festival_name: formName.trim(),
            icon_key: formIconKey,
            app_type: formAppType,
            start_at: isoStart,
            end_at: isoEnd,
            enabled: formEnabled,
        };

        setSubmitting(true);
        try {
            if (editingCampaign) {
                const res = await UpdateFestivalCampaignService(editingCampaign.id, payload, allowOverlap);
                if (res.isConflict) {
                    setOverlapMessage(res.conflictMessage || "Schedule conflict detected with another campaign.");
                    setPendingPayload(payload);
                    setPendingCampaignId(editingCampaign.id);
                    setFormModalVisible(false);
                    setOverlapModalVisible(true);
                    return;
                }
                if (res.success) {
                    showSuccess("Campaign updated successfully!");
                    setFormModalVisible(false);
                    loadCampaigns();
                } else {
                    setFormError(res.message || "Failed to update campaign.");
                }
            } else {
                const res = await CreateFestivalCampaignService(payload, allowOverlap);
                if (res.isConflict) {
                    setOverlapMessage(res.conflictMessage || "Schedule conflict detected with another campaign.");
                    setPendingPayload(payload);
                    setPendingCampaignId(null);
                    setFormModalVisible(false);
                    setOverlapModalVisible(true);
                    return;
                }
                if (res.success) {
                    showSuccess("Festival campaign scheduled successfully!");
                    setFormModalVisible(false);
                    loadCampaigns();
                } else {
                    setFormError(res.message || "Failed to create campaign.");
                }
            }
        } catch (err: any) {
            console.error("Form submit error:", err);
            setFormError(err.message || "An unexpected error occurred.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirmOverlap = async () => {
        if (!pendingPayload) return;
        setOverlapModalVisible(false);
        setSubmitting(true);

        try {
            if (pendingCampaignId) {
                const res = await UpdateFestivalCampaignService(pendingCampaignId, pendingPayload, true);
                if (res.success) {
                    showSuccess("Campaign updated with schedule override!");
                    loadCampaigns();
                } else {
                    showError(res.message || "Failed to override campaign schedule.");
                }
            } else {
                const res = await CreateFestivalCampaignService(pendingPayload, true);
                if (res.success) {
                    showSuccess("Campaign created with schedule override!");
                    loadCampaigns();
                } else {
                    showError(res.message || "Failed to override campaign schedule.");
                }
            }
        } catch (err: any) {
            showError(err.message || "Failed to save override.");
        } finally {
            setSubmitting(false);
            setPendingPayload(null);
            setPendingCampaignId(null);
        }
    };

    const handleToggleEnabled = async (campaign: FestivalCampaign) => {
        const nextState = !campaign.enabled;
        try {
            const res = await UpdateFestivalCampaignService(campaign.id, { enabled: nextState });
            if (res.success) {
                showSuccess(nextState ? "Campaign activated!" : "Campaign paused");
                setCampaigns((prev) =>
                    prev.map((c) => (c.id === campaign.id ? { ...c, enabled: nextState } : c))
                );
            } else {
                showError(res.message || "Failed to update status");
            }
        } catch (err) {
            showError("Failed to update status");
        }
    };

    const handleDelete = async () => {
        if (!campaignToDelete) return;
        setDeleting(true);
        try {
            const res = await DeleteFestivalCampaignService(campaignToDelete.id);
            if (res.success) {
                showSuccess("Campaign deleted successfully");
                setDeleteModalVisible(false);
                setCampaignToDelete(null);
                loadCampaigns();
            } else {
                showError(res.message || "Failed to delete campaign");
            }
        } catch (err) {
            showError("Failed to delete campaign");
        } finally {
            setDeleting(false);
        }
    };

    const formatReadableDate = (iso: string) => {
        try {
            const d = new Date(iso);
            return d.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return iso;
        }
    };

    const getCampaignStatus = (campaign: FestivalCampaign) => {
        const now = new Date();
        const start = new Date(campaign.start_at);
        const end = new Date(campaign.end_at);

        if (!campaign.enabled) {
            return { label: "PAUSED", color: "#64748B", bg: "#F1F5F9", dotColor: "#94A3B8" };
        }
        if (now >= start && now <= end) {
            return { label: "LIVE NOW", color: "#065F46", bg: "#D1FAE5", dotColor: "#10B981" };
        }
        if (now < start) {
            return { label: "UPCOMING", color: "#B45309", bg: "#FEF3C7", dotColor: "#F59E0B" };
        }
        return { label: "EXPIRED", color: "#475569", bg: "#F1F5F9", dotColor: "#94A3B8" };
    };

    const renderCampaignCard = ({ item }: { item: FestivalCampaign }) => {
        const iconMeta = getIconMeta(item.icon_key);
        const status = getCampaignStatus(item);
        const appLabel = item.app_type === "all" ? "DUAL APPS" : item.app_type === "user" ? "USER APP" : "PARTNER APP";
        const appBg = item.app_type === "all" ? "#EEF2FF" : item.app_type === "user" ? "#E0F2FE" : "#DBEAFE";
        const appColor = item.app_type === "all" ? "#4F46E5" : item.app_type === "user" ? "#0284C7" : "#2563EB";

        return (
            <View style={styles.card}>
                {/* Header row */}
                <View style={styles.cardHeaderRow}>
                    <View style={styles.cardTitleContainer}>
                        <View style={[styles.iconAvatar, { backgroundColor: iconMeta.badgeBg }]}>
                            <Ionicons name="sparkles" size={20} color={iconMeta.accentColor} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.cardFestivalName} numberOfLines={1}>
                                {item.festival_name}
                            </Text>
                            <View style={styles.metaRow}>
                                <View style={[styles.appBadge, { backgroundColor: appBg }]}>
                                    <Text style={[styles.appBadgeText, { color: appColor }]}>{appLabel}</Text>
                                </View>
                                <View style={[styles.iconKeyBadge, { backgroundColor: iconMeta.badgeBg }]}>
                                    <Text style={[styles.iconKeyBadgeText, { color: iconMeta.badgeColor }]}>
                                        {iconMeta.label}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Status Badge */}
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        <View style={[styles.statusDot, { backgroundColor: status.dotColor }]} />
                        <Text style={[styles.statusBadgeText, { color: status.color }]}>{status.label}</Text>
                    </View>
                </View>

                {/* Divider */}
                <View style={styles.cardDivider} />

                {/* Date schedule */}
                <View style={styles.datesContainer}>
                    <View style={styles.dateItem}>
                        <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
                        <Text style={styles.dateLabel}>Start:</Text>
                        <Text style={styles.dateValue}>{formatReadableDate(item.start_at)}</Text>
                    </View>
                    <View style={styles.dateItem}>
                        <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
                        <Text style={styles.dateLabel}>End:</Text>
                        <Text style={styles.dateValue}>{formatReadableDate(item.end_at)}</Text>
                    </View>
                </View>

                {/* Footer Controls */}
                <View style={styles.cardFooter}>
                    <View style={styles.switchContainer}>
                        <Text style={styles.switchLabel}>{item.enabled ? "Active" : "Disabled"}</Text>
                        <Switch
                            value={Boolean(item.enabled)}
                            onValueChange={() => handleToggleEnabled(item)}
                            trackColor={{ false: "#CBD5E1", true: "#A7F3D0" }}
                            thumbColor={item.enabled ? COLORS.success : "#94A3B8"}
                        />
                    </View>

                    <View style={styles.actionsGroup}>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.editBtn]}
                            onPress={() => openEditModal(item)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="create-outline" size={16} color="#0284C7" />
                            <Text style={styles.editBtnText}>Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionBtn, styles.deleteBtn]}
                            onPress={() => {
                                setCampaignToDelete(item);
                                setDeleteModalVisible(true);
                            }}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="trash-outline" size={16} color="#DC2626" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.screen}>
            <Header
                value="Festival App Icons"
                subtitle="Dual App Launcher System"
                rightAction={
                    <View style={styles.headerAddBtn}>
                        <Ionicons name="add" size={22} color="#FFFFFF" />
                    </View>
                }
                onRightPress={openCreateModal}
            />

            {/* Main Content Area */}
            <FlatList
                data={filteredCampaigns}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderCampaignCard}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListHeaderComponent={
                    <View style={styles.topSection}>
                        {/* Summary Metrics */}
                        <View style={styles.metricsRow}>
                            <View style={[styles.metricCard, { borderLeftColor: "#10B981" }]}>
                                <Text style={styles.metricLabel}>Live Festivals</Text>
                                <Text style={[styles.metricValue, { color: "#065F46" }]}>{stats.activeNow}</Text>
                            </View>
                            <View style={[styles.metricCard, { borderLeftColor: "#F59E0B" }]}>
                                <Text style={styles.metricLabel}>Upcoming</Text>
                                <Text style={[styles.metricValue, { color: "#B45309" }]}>{stats.upcoming}</Text>
                            </View>
                            <View style={[styles.metricCard, { borderLeftColor: "#3B82F6" }]}>
                                <Text style={styles.metricLabel}>Total Configured</Text>
                                <Text style={[styles.metricValue, { color: "#1E40AF" }]}>{stats.total}</Text>
                            </View>
                        </View>

                        {/* Search Input */}
                        <View style={styles.searchBar}>
                            <Ionicons name="search" size={18} color={COLORS.gray} style={{ marginRight: 8 }} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search by festival name or icon key..."
                                placeholderTextColor={COLORS.textMuted}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                clearButtonMode="while-editing"
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery("")}>
                                    <Ionicons name="close-circle" size={18} color={COLORS.gray} />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Filter Tabs - Target App */}
                        <View style={styles.filterSection}>
                            <Text style={styles.filterHeading}>Target Application:</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
                                {[
                                    { key: "all_filter", label: "All Campaigns" },
                                    { key: "all", label: "Dual Apps" },
                                    { key: "user", label: "User App" },
                                    { key: "partner", label: "Partner App" },
                                ].map((tab) => (
                                    <TouchableOpacity
                                        key={tab.key}
                                        style={[
                                            styles.filterChip,
                                            selectedAppFilter === tab.key && styles.filterChipActive,
                                        ]}
                                        onPress={() => setSelectedAppFilter(tab.key as any)}
                                    >
                                        <Text
                                            style={[
                                                styles.filterChipText,
                                                selectedAppFilter === tab.key && styles.filterChipTextActive,
                                            ]}
                                        >
                                            {tab.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Filter Tabs - Status */}
                        <View style={styles.filterSection}>
                            <Text style={styles.filterHeading}>Status:</Text>
                            <View style={styles.statusPillsRow}>
                                {[
                                    { key: "all", label: "All" },
                                    { key: "active", label: "Enabled Only" },
                                    { key: "disabled", label: "Paused Only" },
                                ].map((tab) => (
                                    <TouchableOpacity
                                        key={tab.key}
                                        style={[
                                            styles.statusPill,
                                            selectedStatusFilter === tab.key && styles.statusPillActive,
                                        ]}
                                        onPress={() => setSelectedStatusFilter(tab.key as any)}
                                    >
                                        <Text
                                            style={[
                                                styles.statusPillText,
                                                selectedStatusFilter === tab.key && styles.statusPillTextActive,
                                            ]}
                                        >
                                            {tab.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Schedule Campaign Action Button */}
                        <TouchableOpacity style={styles.ctaButton} onPress={openCreateModal} activeOpacity={0.85}>
                            <Ionicons name="calendar" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                            <Text style={styles.ctaButtonText}>Schedule New Festival Campaign</Text>
                        </TouchableOpacity>

                        <Text style={styles.sectionTitle}>
                            Festival Windows ({filteredCampaigns.length})
                        </Text>
                    </View>
                }
                ListEmptyComponent={
                    loading ? (
                        <View style={styles.emptyContainer}>
                            <ActivityIndicator size="large" color={COLORS.primary} />
                            <Text style={styles.emptyText}>Loading festival calendar...</Text>
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="sparkles-outline" size={48} color={COLORS.gray} />
                            <Text style={styles.emptyTitle}>No Festival Campaigns Found</Text>
                            <Text style={styles.emptySub}>
                                {searchQuery || selectedAppFilter !== "all_filter"
                                    ? "Try adjusting your filters or search terms."
                                    : "Schedule your first festival window to enable dynamic app icon switching."}
                            </Text>
                        </View>
                    )
                }
            />

            {/* CREATE / EDIT CAMPAIGN MODAL */}
            <Modal
                visible={formModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setFormModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <View style={styles.modalHeaderTitleRow}>
                                <View style={styles.modalHeaderIcon}>
                                    <Ionicons name="color-palette" size={20} color={COLORS.primary} />
                                </View>
                                <Text style={styles.modalTitle}>
                                    {editingCampaign ? "Edit Festival Window" : "Schedule Festival Icon"}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setFormModalVisible(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                            {formError ? (
                                <View style={styles.formErrorBox}>
                                    <Ionicons name="alert-circle" size={18} color="#DC2626" style={{ marginRight: 6 }} />
                                    <Text style={styles.formErrorText}>{formError}</Text>
                                </View>
                            ) : null}

                            {/* Festival Name */}
                            <Text style={styles.inputLabel}>Festival Campaign Name *</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="e.g. Deepavali Celebration 2027"
                                placeholderTextColor={COLORS.textMuted}
                                value={formName}
                                onChangeText={setFormName}
                                maxLength={100}
                            />

                            {/* Target App */}
                            <Text style={styles.inputLabel}>Target Application *</Text>
                            <View style={styles.appTypeSelector}>
                                {[
                                    { key: "all", label: "Dual Apps (User & Partner)", icon: "phone-portrait" },
                                    { key: "user", label: "User App Only", icon: "person" },
                                    { key: "partner", label: "Partner App Only", icon: "car-sport" },
                                ].map((t) => (
                                    <TouchableOpacity
                                        key={t.key}
                                        style={[
                                            styles.appTypeOption,
                                            formAppType === t.key && styles.appTypeOptionSelected,
                                        ]}
                                        onPress={() => setFormAppType(t.key as AppType)}
                                    >
                                        <Ionicons
                                            name={t.icon as any}
                                            size={16}
                                            color={formAppType === t.key ? COLORS.primary : COLORS.textSecondary}
                                            style={{ marginRight: 8 }}
                                        />
                                        <Text
                                            style={[
                                                styles.appTypeOptionText,
                                                formAppType === t.key && styles.appTypeOptionTextSelected,
                                            ]}
                                        >
                                            {t.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Icon Key Selection Grid */}
                            <Text style={styles.inputLabel}>Launcher Icon Graphic *</Text>
                            <Text style={styles.helperText}>
                                The chosen icon graphic will be dynamically applied while this window is active.
                            </Text>
                            <View style={styles.iconGrid}>
                                {FESTIVAL_ICON_OPTIONS.map((opt) => {
                                    const isSelected = formIconKey === opt.key;
                                    return (
                                        <TouchableOpacity
                                            key={opt.key}
                                            style={[
                                                styles.iconGridItem,
                                                isSelected && { borderColor: opt.accentColor, backgroundColor: opt.badgeBg },
                                            ]}
                                            onPress={() => setFormIconKey(opt.key)}
                                        >
                                            <View
                                                style={[
                                                    styles.iconCircle,
                                                    { backgroundColor: opt.badgeBg },
                                                    isSelected && { borderColor: opt.accentColor, borderWidth: 2 },
                                                ]}
                                            >
                                                <Ionicons
                                                    name="sparkles"
                                                    size={18}
                                                    color={opt.accentColor}
                                                />
                                            </View>
                                            <Text
                                                style={[
                                                    styles.iconGridLabel,
                                                    isSelected && { color: opt.accentColor, fontWeight: "700" },
                                                ]}
                                                numberOfLines={1}
                                            >
                                                {opt.label}
                                            </Text>
                                            <Text style={styles.iconGridSub}>{opt.category}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Start Date & Time */}
                            <Text style={styles.inputLabel}>Start Date & Time (YYYY-MM-DD HH:mm) *</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="YYYY-MM-DD HH:mm"
                                placeholderTextColor={COLORS.textMuted}
                                value={formStartAt}
                                onChangeText={setFormStartAt}
                            />

                            {/* End Date & Time */}
                            <Text style={styles.inputLabel}>End Date & Time (YYYY-MM-DD HH:mm) *</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="YYYY-MM-DD HH:mm"
                                placeholderTextColor={COLORS.textMuted}
                                value={formEndAt}
                                onChangeText={setFormEndAt}
                            />

                            {/* Quick Presets */}
                            <View style={styles.presetsRow}>
                                <Text style={styles.presetHeading}>Quick Windows:</Text>
                                <TouchableOpacity style={styles.presetBtn} onPress={() => setPresetDates(0, 3)}>
                                    <Text style={styles.presetBtnText}>Today (3 Days)</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.presetBtn} onPress={() => setPresetDates(1, 4)}>
                                    <Text style={styles.presetBtnText}>Tomorrow (4 Days)</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.presetBtn} onPress={() => setPresetDates(7, 7)}>
                                    <Text style={styles.presetBtnText}>Next Week</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Enabled switch */}
                            <View style={styles.formSwitchRow}>
                                <View>
                                    <Text style={styles.formSwitchTitle}>Enable Campaign Immediately</Text>
                                    <Text style={styles.formSwitchSub}>
                                        If active, mobile apps will switch icons when the window begins
                                    </Text>
                                </View>
                                <Switch
                                    value={formEnabled}
                                    onValueChange={setFormEnabled}
                                    trackColor={{ false: "#CBD5E1", true: "#A7F3D0" }}
                                    thumbColor={formEnabled ? COLORS.success : "#94A3B8"}
                                />
                            </View>

                            <View style={{ height: 24 }} />
                        </ScrollView>

                        {/* Modal Action Buttons */}
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => setFormModalVisible(false)}
                                disabled={submitting}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.saveBtn, submitting && { opacity: 0.7 }]}
                                onPress={() => handleFormSubmit(false)}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.saveBtnText}>
                                        {editingCampaign ? "Update Campaign" : "Schedule Festival"}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* OVERLAP CONFLICT MODAL (409 Conflict Handling) */}
            <Modal
                visible={overlapModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setOverlapModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.conflictCard}>
                        <View style={styles.conflictIconCircle}>
                            <Ionicons name="warning" size={32} color="#D97706" />
                        </View>
                        <Text style={styles.conflictTitle}>Campaign Schedule Conflict</Text>
                        <Text style={styles.conflictMessage}>{overlapMessage}</Text>
                        <Text style={styles.conflictSub}>
                            An active or overlapping festival window already exists for this app target during the selected dates.
                            Would you like to override and schedule this campaign anyway?
                        </Text>

                        <View style={styles.conflictActionsRow}>
                            <TouchableOpacity
                                style={styles.conflictCancelBtn}
                                onPress={() => {
                                    setOverlapModalVisible(false);
                                    setFormModalVisible(true);
                                }}
                            >
                                <Text style={styles.conflictCancelBtnText}>Cancel & Adjust</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.conflictOverrideBtn}
                                onPress={handleConfirmOverlap}
                            >
                                <Text style={styles.conflictOverrideBtnText}>Override & Schedule</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* DELETE CONFIRMATION MODAL */}
            <Modal
                visible={deleteModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setDeleteModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.deleteCard}>
                        <View style={styles.deleteIconCircle}>
                            <Ionicons name="trash" size={28} color="#DC2626" />
                        </View>
                        <Text style={styles.deleteTitle}>Delete Festival Campaign?</Text>
                        <Text style={styles.deleteMessage}>
                            Are you sure you want to delete "{campaignToDelete?.festival_name}"? Mobile apps will fall back to their default launcher icon once removed.
                        </Text>

                        <View style={styles.deleteActionsRow}>
                            <TouchableOpacity
                                style={styles.deleteCancelBtn}
                                onPress={() => setDeleteModalVisible(false)}
                                disabled={deleting}
                            >
                                <Text style={styles.deleteCancelBtnText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.deleteConfirmBtn, deleting && { opacity: 0.7 }]}
                                onPress={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.deleteConfirmBtnText}>Delete Campaign</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default FestivalCampaigns;

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    headerAddBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(255, 255, 255, 0.25)",
        alignItems: "center",
        justifyContent: "center",
    },
    listContent: {
        padding: 16,
        paddingBottom: 36,
    },
    topSection: {
        marginBottom: 12,
    },
    metricsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
        gap: 8,
    },
    metricCard: {
        flex: 1,
        backgroundColor: COLORS.surface,
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderLeftWidth: 4,
        ...SHADOWS.sm,
    },
    metricLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    metricValue: {
        fontSize: 18,
        fontWeight: "800",
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.surface,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 14,
        ...SHADOWS.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: COLORS.textMain,
        padding: 0,
    },
    filterSection: {
        marginBottom: 12,
    },
    filterHeading: {
        fontSize: 12,
        fontWeight: "700",
        color: COLORS.textSecondary,
        marginBottom: 6,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    filterRow: {
        flexDirection: "row",
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginRight: 8,
    },
    filterChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterChipText: {
        fontSize: 12,
        fontWeight: "600",
        color: COLORS.textSecondary,
    },
    filterChipTextActive: {
        color: "#FFFFFF",
    },
    statusPillsRow: {
        flexDirection: "row",
        gap: 8,
    },
    statusPill: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statusPillActive: {
        backgroundColor: "#0F172A",
        borderColor: "#0F172A",
    },
    statusPillText: {
        fontSize: 12,
        fontWeight: "600",
        color: COLORS.textSecondary,
    },
    statusPillTextActive: {
        color: "#FFFFFF",
    },
    ctaButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginVertical: 14,
        ...SHADOWS.md,
    },
    ctaButtonText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: COLORS.textMain,
        marginTop: 6,
        marginBottom: 10,
    },
    // Cards
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        ...SHADOWS.sm,
    },
    cardHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    cardTitleContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    iconAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    cardFestivalName: {
        fontSize: 15,
        fontWeight: "700",
        color: COLORS.textMain,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
        gap: 6,
    },
    appBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    appBadgeText: {
        fontSize: 10,
        fontWeight: "700",
    },
    iconKeyBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    iconKeyBadgeText: {
        fontSize: 10,
        fontWeight: "600",
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 5,
    },
    statusBadgeText: {
        fontSize: 11,
        fontWeight: "700",
    },
    cardDivider: {
        height: 1,
        backgroundColor: COLORS.borderLight,
        marginVertical: 10,
    },
    datesContainer: {
        gap: 4,
        marginBottom: 10,
    },
    dateItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    dateLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: COLORS.textSecondary,
        width: 44,
    },
    dateValue: {
        fontSize: 12,
        color: COLORS.textMain,
        fontWeight: "500",
    },
    cardFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    switchContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    switchLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: COLORS.textSecondary,
        marginRight: 6,
    },
    actionsGroup: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    actionBtn: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        flexDirection: "row",
        alignItems: "center",
    },
    editBtn: {
        backgroundColor: "#E0F2FE",
    },
    editBtnText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#0284C7",
        marginLeft: 4,
    },
    deleteBtn: {
        backgroundColor: "#FEE2E2",
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.textMain,
        marginTop: 12,
    },
    emptySub: {
        fontSize: 13,
        color: COLORS.textSecondary,
        textAlign: "center",
        marginTop: 4,
        paddingHorizontal: 24,
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 10,
    },

    // Modals
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    modalCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        width: "100%",
        maxHeight: "90%",
        padding: 18,
        ...SHADOWS.lg,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
        paddingBottom: 12,
        marginBottom: 12,
    },
    modalHeaderTitleRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    modalHeaderIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: COLORS.primaryLight,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: COLORS.textMain,
    },
    modalScroll: {
        maxHeight: 460,
    },
    formErrorBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FEE2E2",
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
    },
    formErrorText: {
        flex: 1,
        fontSize: 12,
        fontWeight: "600",
        color: "#DC2626",
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: "700",
        color: COLORS.textSecondary,
        marginTop: 10,
        marginBottom: 6,
        textTransform: "uppercase",
        letterSpacing: 0.3,
    },
    helperText: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 9,
        fontSize: 14,
        color: COLORS.textMain,
    },
    appTypeSelector: {
        flexDirection: "column",
        gap: 6,
    },
    appTypeOption: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.background,
    },
    appTypeOptionSelected: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primaryLight,
    },
    appTypeOptionText: {
        fontSize: 13,
        fontWeight: "500",
        color: COLORS.textSecondary,
    },
    appTypeOptionTextSelected: {
        color: COLORS.primary,
        fontWeight: "700",
    },
    iconGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 8,
    },
    iconGridItem: {
        width: "31%",
        backgroundColor: COLORS.background,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingVertical: 10,
        paddingHorizontal: 6,
        alignItems: "center",
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
    },
    iconGridLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: COLORS.textMain,
        textAlign: "center",
    },
    iconGridSub: {
        fontSize: 9,
        color: COLORS.textMuted,
        marginTop: 1,
    },
    presetsRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 6,
        marginTop: 8,
    },
    presetHeading: {
        fontSize: 11,
        fontWeight: "600",
        color: COLORS.textMuted,
    },
    presetBtn: {
        backgroundColor: "#F1F5F9",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    presetBtnText: {
        fontSize: 11,
        fontWeight: "600",
        color: COLORS.textSecondary,
    },
    formSwitchRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: COLORS.background,
        padding: 12,
        borderRadius: 8,
        marginTop: 14,
    },
    formSwitchTitle: {
        fontSize: 13,
        fontWeight: "600",
        color: COLORS.textMain,
    },
    formSwitchSub: {
        fontSize: 11,
        color: COLORS.textMuted,
        maxWidth: 240,
        marginTop: 2,
    },
    modalFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 10,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
        paddingTop: 12,
        marginTop: 10,
    },
    cancelBtn: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cancelBtnText: {
        fontSize: 13,
        fontWeight: "600",
        color: COLORS.textSecondary,
    },
    saveBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 8,
    },
    saveBtnText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#FFFFFF",
    },

    // Conflict Card
    conflictCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 20,
        width: "90%",
        alignItems: "center",
        ...SHADOWS.lg,
    },
    conflictIconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#FEF3C7",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    conflictTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: COLORS.textMain,
        marginBottom: 8,
        textAlign: "center",
    },
    conflictMessage: {
        fontSize: 13,
        fontWeight: "600",
        color: "#B45309",
        textAlign: "center",
        backgroundColor: "#FFFBEB",
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
    },
    conflictSub: {
        fontSize: 12,
        color: COLORS.textSecondary,
        textAlign: "center",
        marginBottom: 16,
        lineHeight: 18,
    },
    conflictActionsRow: {
        flexDirection: "row",
        gap: 10,
        width: "100%",
    },
    conflictCancelBtn: {
        flex: 1,
        paddingVertical: 11,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: "center",
    },
    conflictCancelBtnText: {
        fontSize: 13,
        fontWeight: "600",
        color: COLORS.textSecondary,
    },
    conflictOverrideBtn: {
        flex: 1,
        paddingVertical: 11,
        borderRadius: 8,
        backgroundColor: "#D97706",
        alignItems: "center",
    },
    conflictOverrideBtnText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#FFFFFF",
    },

    // Delete Card
    deleteCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 20,
        width: "90%",
        alignItems: "center",
        ...SHADOWS.lg,
    },
    deleteIconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: "#FEE2E2",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    deleteTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: COLORS.textMain,
        marginBottom: 6,
    },
    deleteMessage: {
        fontSize: 13,
        color: COLORS.textSecondary,
        textAlign: "center",
        marginBottom: 16,
        lineHeight: 18,
    },
    deleteActionsRow: {
        flexDirection: "row",
        gap: 10,
        width: "100%",
    },
    deleteCancelBtn: {
        flex: 1,
        paddingVertical: 11,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: "center",
    },
    deleteCancelBtnText: {
        fontSize: 13,
        fontWeight: "600",
        color: COLORS.textSecondary,
    },
    deleteConfirmBtn: {
        flex: 1,
        paddingVertical: 11,
        borderRadius: 8,
        backgroundColor: "#DC2626",
        alignItems: "center",
    },
    deleteConfirmBtnText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#FFFFFF",
    },
});
