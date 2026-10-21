import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Modal,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import Header from "../../../Common/PageHeader";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import { COLORS, SHADOWS } from "../../../utils/ColorCode";
import { getTermsService, updateTermsService } from "./helper";

interface ClauseItem {
    id: string;
    title: string;
    description: string;
}

const cleanHtml = (text?: string): string => {
    if (!text) return "";
    return text
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n\n")
        .replace(/<li>/gi, "• ")
        .replace(/<\/li>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&quot;/gi, '"')
        .trim();
};

const TermsAndConditions = () => {
    const value = "Terms & Conditions";
    const [selectedAppType, setSelectedAppType] = useState<"user" | "partner">("user");
    const [loading, setLoading] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Pure API Data States
    const [heading, setHeading] = useState<string>("");
    const [content, setContent] = useState<string>("");
    const [clauses, setClauses] = useState<ClauseItem[]>([]);
    const [apiLoaded, setApiLoaded] = useState<boolean>(false);

    // Edit modal states
    const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
    const [editHeading, setEditHeading] = useState<string>("");
    const [editContent, setEditContent] = useState<string>("");
    const [editClauses, setEditClauses] = useState<ClauseItem[]>([]);
    const [saving, setSaving] = useState<boolean>(false);

    const fetchTerms = async (appType: "user" | "partner", isRefresh: boolean = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const res = await getTermsService(appType);
            const root = res?.data;
            const resObj = root?.data ?? root;

            setHeading("");
            setContent("");
            setClauses([]);
            setApiLoaded(true);

            if (resObj && typeof resObj === "object") {
                const h = cleanHtml(resObj?.heading ?? resObj?.title ?? "");
                const c = cleanHtml(resObj?.content ?? resObj?.description ?? resObj?.terms ?? "");
                setHeading(h);
                setContent(c);

                let items: any[] = [];
                if (Array.isArray(resObj?.data)) {
                    items = resObj.data;
                } else if (Array.isArray(resObj?.clauses)) {
                    items = resObj.clauses;
                } else if (Array.isArray(resObj)) {
                    items = resObj;
                }

                const parsedClauses: ClauseItem[] = items.map((item: any, idx: number) => ({
                    id: String(item?.id ?? idx),
                    title: cleanHtml(item?.title ?? item?.heading ?? `Clause ${idx + 1}`),
                    description: cleanHtml(
                        item?.description ?? item?.content ?? item?.terms ?? String(item)
                    ),
                }));
                setClauses(parsedClauses);
            } else if (typeof resObj === "string" && resObj.trim().length > 0) {
                setHeading("Terms & Conditions");
                setContent(cleanHtml(resObj));
                setClauses([]);
            }
        } catch (error: any) {
            setHeading("");
            setContent("");
            setClauses([]);
            setApiLoaded(true);
            showError(error?.message || "Failed to load terms from server");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTerms(selectedAppType);
    }, [selectedAppType]);

    const onRefresh = () => {
        fetchTerms(selectedAppType, true);
    };

    const handleOpenEdit = () => {
        setEditHeading(heading || "Terms & Conditions");
        setEditContent(content || "");
        setEditClauses(clauses.length > 0 ? [...clauses] : []);
        setIsEditModalVisible(true);
    };

    const handleAddClause = () => {
        setEditClauses((prev) => [
            ...prev,
            {
                id: Date.now().toString(),
                title: `${prev.length + 1}. `,
                description: "",
            },
        ]);
    };

    const handleRemoveClause = (id: string) => {
        setEditClauses((prev) => prev.filter((c) => c.id !== id));
    };

    const handleClauseChange = (index: number, field: "title" | "description", val: string) => {
        setEditClauses((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: val };
            return next;
        });
    };

    const handleSaveEdit = async () => {
        if (!editHeading.trim()) {
            showError("Please enter a heading");
            return;
        }

        const validClauses = editClauses.filter(
            (c) => c.title.trim().length > 0 || c.description.trim().length > 0
        );

        if (validClauses.length === 0 && !editContent.trim()) {
            showError("Please enter policy content or at least one clause");
            return;
        }

        // Exact API payload contract requested:
        const payload = {
            app_type: selectedAppType,
            heading: editHeading.trim(),
            content: editContent.trim(),
            data: validClauses.map((c) => ({
                title: c.title.trim(),
                description: c.description.trim(),
            })),
        };

        setSaving(true);
        try {
            const res = await updateTermsService(payload);
            const { data: { success = false, message = "" } = {} } = res || {};

            if (success === true || res?.status === 200 || res?.status === 201) {
                showSuccess(message || "Terms successfully updated on server");
                setIsEditModalVisible(false);
                fetchTerms(selectedAppType);
            } else {
                showError(message || "Failed to update terms on server");
            }
        } catch (error: any) {
            showError(error?.message || "Failed to save terms to server");
        } finally {
            setSaving(false);
        }
    };

    // Filter clauses if searching
    const filteredClauses = clauses.filter((c) => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return true;
        return c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
    });

    const hasData = clauses.length > 0 || heading.trim().length > 0 || content.trim().length > 0;

    return (
        <View style={styles.container}>
            <Header value={value} subtitle="Live Policies Synced with API" />

            {/* App Type Switcher */}
            <View style={styles.appTypeWrapper}>
                <View style={styles.appTypeTabs}>
                    <TouchableOpacity
                        style={[
                            styles.appTypeTab,
                            selectedAppType === "user" && styles.appTypeTabActive,
                        ]}
                        onPress={() => setSelectedAppType("user")}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name="person-outline"
                            size={16}
                            color={selectedAppType === "user" ? "#FFFFFF" : COLORS.textSecondary}
                        />
                        <Text
                            style={[
                                styles.appTypeTabText,
                                selectedAppType === "user" && styles.appTypeTabTextActive,
                            ]}
                        >
                            User / Rider App
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.appTypeTab,
                            selectedAppType === "partner" && styles.appTypeTabActive,
                        ]}
                        onPress={() => setSelectedAppType("partner")}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name="car-sport-outline"
                            size={16}
                            color={selectedAppType === "partner" ? "#FFFFFF" : COLORS.textSecondary}
                        />
                        <Text
                            style={[
                                styles.appTypeTabText,
                                selectedAppType === "partner" && styles.appTypeTabTextActive,
                            ]}
                        >
                            Driver Partner App
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
            >
                {/* API Status Banner */}
                <View style={styles.apiBanner}>
                    <View style={styles.apiIconWrapper}>
                        <Ionicons name="cloud-done-outline" size={22} color="#0284C7" />
                    </View>
                    <View style={styles.apiBannerText}>
                        <Text style={styles.apiBannerTitle}>
                            API Source: /admin/terms?app_type={selectedAppType}
                        </Text>
                        <Text style={styles.apiBannerSubtitle}>
                            {hasData ? "Displaying live server terms" : "Awaiting data from server"}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={handleOpenEdit}
                        activeOpacity={0.75}
                    >
                        <Ionicons name="create-outline" size={14} color="#0284C7" />
                        <Text style={styles.editButtonText}>{hasData ? "Edit" : "Create"}</Text>
                    </TouchableOpacity>
                </View>

                {/* Search Box */}
                {clauses.length > 0 && (
                    <View style={styles.searchBox}>
                        <Ionicons name="search-outline" size={18} color="#94A3B8" />
                        <TextInput
                            placeholder="Search clauses..."
                            placeholderTextColor="#94A3B8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            style={styles.searchInput}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery("")}>
                                <Ionicons name="close-circle" size={18} color="#94A3B8" />
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Content Renderers */}
                {loading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loaderText}>Fetching terms from server...</Text>
                    </View>
                ) : !hasData && apiLoaded ? (
                    /* Clean Empty State when API has no data */
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconBox}>
                            <Ionicons name="document-text-outline" size={44} color="#94A3B8" />
                        </View>
                        <Text style={styles.emptyTitle}>No Terms & Conditions Found</Text>
                        <Text style={styles.emptySubtitle}>
                            The server returned no terms data for app_type="{selectedAppType}".
                        </Text>
                        <View style={styles.emptyActionRow}>
                            <TouchableOpacity
                                style={styles.emptyRefreshButton}
                                onPress={() => fetchTerms(selectedAppType)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="refresh" size={16} color={COLORS.primary} />
                                <Text style={styles.emptyRefreshButtonText}>Retry Fetch</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.emptyAddButton}
                                onPress={handleOpenEdit}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="add-circle-outline" size={16} color="#FFFFFF" />
                                <Text style={styles.emptyAddButtonText}>Create Terms</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : hasData ? (
                    /* Display Server Terms Document & Clauses */
                    <View style={styles.termsCard}>
                        {/* Heading */}
                        <View style={styles.termsHeaderRow}>
                            <View style={styles.termsHeaderLeft}>
                                <Text style={styles.termsHeadingText}>
                                    {heading || "Terms & Conditions"}
                                </Text>
                                <View style={styles.badgeRow}>
                                    <View style={styles.typeBadge}>
                                        <Text style={styles.typeBadgeText}>
                                            {selectedAppType.toUpperCase()}
                                        </Text>
                                    </View>
                                    {clauses.length > 0 && (
                                        <Text style={styles.countBadgeText}>
                                            • {clauses.length} Clauses
                                        </Text>
                                    )}
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.editActionHeader}
                                onPress={handleOpenEdit}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="create-outline" size={16} color="#0284C7" />
                            </TouchableOpacity>
                        </View>

                        {/* Content / Preamble */}
                        {content.trim().length > 0 && (
                            <View style={styles.preambleContainer}>
                                <Text style={styles.preambleText}>{content}</Text>
                            </View>
                        )}

                        {/* Clauses List */}
                        {filteredClauses.length > 0 && (
                            <View style={styles.clausesList}>
                                {filteredClauses.map((clause, idx) => (
                                    <View key={clause.id} style={styles.clauseRow}>
                                        <View style={styles.clauseHeader}>
                                            <View style={styles.clauseBullet}>
                                                <Text style={styles.clauseBulletText}>
                                                    {idx + 1}
                                                </Text>
                                            </View>
                                            <Text style={styles.clauseTitleText}>
                                                {clause.title}
                                            </Text>
                                        </View>
                                        <Text style={styles.clauseDescText}>
                                            {clause.description}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Footer Actions */}
                        <View style={styles.termsFooter}>
                            <TouchableOpacity
                                style={styles.copyButton}
                                onPress={() => {
                                    showSuccess("Terms text copied to clipboard");
                                }}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="copy-outline" size={15} color="#64748B" />
                                <Text style={styles.copyButtonText}>Copy Text</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.updateButton}
                                onPress={handleOpenEdit}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="create-outline" size={15} color="#FFFFFF" />
                                <Text style={styles.updateButtonText}>Edit Policy</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : null}
            </ScrollView>

            {/* Edit / Create Terms Modal */}
            <Modal
                visible={isEditModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setIsEditModalVisible(false)}
            >
                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                >
                    <View style={styles.modalCard}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <View style={styles.modalHeaderInfo}>
                                <Text style={styles.modalTitle}>
                                    {hasData ? "Edit Terms & Conditions" : "Create Terms & Conditions"}
                                </Text>
                                <Text style={styles.modalSubtitle}>
                                    PUT /admin/terms for {selectedAppType} app
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setIsEditModalVisible(false)}
                                style={styles.modalCloseButton}
                            >
                                <Ionicons name="close" size={22} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        {/* Modal Body Scroll */}
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.modalScrollBody}
                        >
                            {/* Heading Field */}
                            <Text style={styles.fieldLabel}>Heading</Text>
                            <TextInput
                                value={editHeading}
                                onChangeText={setEditHeading}
                                placeholder="e.g. Terms & Conditions"
                                placeholderTextColor="#94A3B8"
                                style={styles.textInput}
                            />

                            {/* Preamble / Content Field */}
                            <Text style={styles.fieldLabel}>Preamble / Content</Text>
                            <TextInput
                                value={editContent}
                                onChangeText={setEditContent}
                                placeholder="Please read these terms and conditions carefully..."
                                placeholderTextColor="#94A3B8"
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                                style={[styles.textInput, styles.textArea]}
                            />

                            {/* Clauses Header */}
                            <View style={styles.clausesHeaderRow}>
                                <Text style={styles.clausesSectionLabel}>
                                    Clauses ({editClauses.length})
                                </Text>
                                <TouchableOpacity
                                    style={styles.addClauseLink}
                                    onPress={handleAddClause}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="add-circle" size={16} color={COLORS.primary} />
                                    <Text style={styles.addClauseLinkText}>Add Clause</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Dynamic Clauses Inputs */}
                            {editClauses.length === 0 ? (
                                <View style={styles.noClauseBox}>
                                    <Ionicons name="document-text-outline" size={30} color="#94A3B8" />
                                    <Text style={styles.noClauseText}>No clauses added yet</Text>
                                    <TouchableOpacity
                                        style={styles.addFirstClauseButton}
                                        onPress={handleAddClause}
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons name="add-circle-outline" size={16} color={COLORS.primary} />
                                        <Text style={styles.addFirstClauseButtonText}>Add First Clause</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                editClauses.map((clause, index) => (
                                    <View key={clause.id} style={styles.clauseInputCard}>
                                        <View style={styles.clauseInputHeader}>
                                            <Text style={styles.clauseIndexText}>
                                                Clause #{index + 1}
                                            </Text>
                                            <TouchableOpacity
                                                onPress={() => handleRemoveClause(clause.id)}
                                                activeOpacity={0.7}
                                                style={styles.removeClauseButton}
                                            >
                                                <Ionicons name="trash-outline" size={16} color="#DC2626" />
                                            </TouchableOpacity>
                                        </View>

                                        <TextInput
                                            value={clause.title}
                                            onChangeText={(val) =>
                                                handleClauseChange(index, "title", val)
                                            }
                                            placeholder={`Clause Title (e.g. ${index + 1}. Account Eligibility)`}
                                            placeholderTextColor="#94A3B8"
                                            style={styles.clauseTitleInput}
                                        />

                                        <TextInput
                                            value={clause.description}
                                            onChangeText={(val) =>
                                                handleClauseChange(index, "description", val)
                                            }
                                            placeholder="Clause detailed description..."
                                            placeholderTextColor="#94A3B8"
                                            multiline
                                            numberOfLines={2}
                                            textAlignVertical="top"
                                            style={styles.clauseDescInput}
                                        />
                                    </View>
                                ))
                            )}
                        </ScrollView>

                        {/* Modal Action Buttons */}
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setIsEditModalVisible(false)}
                                activeOpacity={0.75}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleSaveEdit}
                                disabled={saving}
                                activeOpacity={0.85}
                            >
                                {saving ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Publish to API</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

export default TermsAndConditions;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    appTypeWrapper: {
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    appTypeTabs: {
        flexDirection: "row",
        backgroundColor: "#F1F5F9",
        padding: 4,
        borderRadius: 12,
    },
    appTypeTab: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 9,
        borderRadius: 9,
    },
    appTypeTabActive: {
        backgroundColor: COLORS.primary,
        ...SHADOWS.sm,
    },
    appTypeTabText: {
        fontSize: 12,
        fontWeight: "700",
        color: COLORS.textSecondary,
        marginLeft: 6,
    },
    appTypeTabTextActive: {
        color: "#FFFFFF",
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    apiBanner: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 14,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    apiIconWrapper: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: "#E0F2FE",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    apiBannerText: {
        flex: 1,
    },
    apiBannerTitle: {
        fontSize: 12,
        fontWeight: "700",
        color: COLORS.textMain,
    },
    apiBannerSubtitle: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    editButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F0F9FF",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#BAE6FD",
    },
    editButtonText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#0284C7",
        marginLeft: 4,
    },
    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 42,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 14,
        ...SHADOWS.sm,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 13,
        color: COLORS.textMain,
        paddingVertical: 0,
    },
    loaderContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    loaderText: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginTop: 12,
        fontWeight: "600",
    },
    emptyContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
        marginTop: 10,
        ...SHADOWS.sm,
    },
    emptyIconBox: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#F1F5F9",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 14,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: COLORS.textMain,
    },
    emptySubtitle: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 4,
        textAlign: "center",
        lineHeight: 18,
    },
    emptyActionRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginTop: 20,
    },
    emptyRefreshButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    emptyRefreshButtonText: {
        fontSize: 12,
        fontWeight: "700",
        color: COLORS.primary,
        marginLeft: 6,
    },
    emptyAddButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 10,
    },
    emptyAddButtonText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#FFFFFF",
        marginLeft: 6,
    },
    termsCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 18,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    termsHeaderRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    termsHeaderLeft: {
        flex: 1,
        paddingRight: 10,
    },
    termsHeadingText: {
        fontSize: 18,
        fontWeight: "800",
        color: COLORS.textMain,
    },
    badgeRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    typeBadge: {
        backgroundColor: "#E0F2FE",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    typeBadgeText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#0369A1",
    },
    countBadgeText: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginLeft: 6,
    },
    editActionHeader: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: "#F0F9FF",
        alignItems: "center",
        justifyContent: "center",
    },
    preambleContainer: {
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    preambleText: {
        fontSize: 13,
        color: "#475569",
        lineHeight: 20,
    },
    clausesList: {
        gap: 12,
    },
    clauseRow: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    clauseHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    clauseBullet: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: "#E0F2FE",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
    },
    clauseBulletText: {
        fontSize: 11,
        fontWeight: "800",
        color: "#0284C7",
    },
    clauseTitleText: {
        fontSize: 14,
        fontWeight: "700",
        color: COLORS.textMain,
        flex: 1,
    },
    clauseDescText: {
        fontSize: 13,
        color: "#475569",
        lineHeight: 20,
        marginLeft: 30,
    },
    termsFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 10,
        marginTop: 20,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },
    copyButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    copyButtonText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#64748B",
        marginLeft: 6,
    },
    updateButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.primary,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
    },
    updateButtonText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#FFFFFF",
        marginLeft: 6,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        justifyContent: "center",
        padding: 16,
    },
    modalCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        maxHeight: "90%",
        padding: 18,
        ...SHADOWS.lg,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    modalHeaderInfo: {
        flex: 1,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: COLORS.textMain,
    },
    modalSubtitle: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    modalCloseButton: {
        padding: 4,
    },
    modalScrollBody: {
        paddingVertical: 12,
    },
    fieldLabel: {
        fontSize: 11,
        fontWeight: "700",
        color: COLORS.textSecondary,
        marginBottom: 6,
        marginTop: 10,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    textInput: {
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 9,
        fontSize: 13,
        color: COLORS.textMain,
    },
    textArea: {
        height: 70,
    },
    clausesHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 14,
        marginBottom: 10,
    },
    clausesSectionLabel: {
        fontSize: 12,
        fontWeight: "800",
        color: COLORS.textMain,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    addClauseLink: {
        flexDirection: "row",
        alignItems: "center",
    },
    addClauseLinkText: {
        fontSize: 12,
        fontWeight: "700",
        color: COLORS.primary,
        marginLeft: 4,
    },
    clauseInputCard: {
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        marginBottom: 10,
    },
    clauseInputHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    clauseIndexText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#0284C7",
    },
    removeClauseButton: {
        padding: 2,
    },
    clauseTitleInput: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 7,
        fontSize: 12,
        color: COLORS.textMain,
        fontWeight: "600",
        marginBottom: 8,
    },
    clauseDescInput: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 7,
        fontSize: 12,
        color: COLORS.textMain,
        height: 54,
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
        gap: 10,
    },
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cancelButtonText: {
        fontSize: 13,
        fontWeight: "600",
        color: COLORS.textSecondary,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        minWidth: 120,
        alignItems: "center",
    },
    saveButtonText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    noClauseBox: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderStyle: "dashed",
        marginBottom: 10,
    },
    noClauseText: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 6,
        marginBottom: 10,
    },
    addFirstClauseButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F0F9FF",
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#BAE6FD",
    },
    addFirstClauseButtonText: {
        fontSize: 12,
        fontWeight: "700",
        color: COLORS.primary,
        marginLeft: 6,
    },
});
