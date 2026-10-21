import React, { useEffect, useState } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    TextInput,
    ActivityIndicator,
    FlatList,
    Modal,
    StyleSheet,
    Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import Header from "../../../Common/PageHeader";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import { DeleteFeedbackService, GetFeedbackService, UpdateFeedbackService } from "./helper";
import { COLORS, SHADOWS } from "../../../utils/ColorCode";

const FeedbackList = () => {
    const value = "Feedback Tags";
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [feedBackList, setFeedbackList] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);

    const targetTypeOptions = [
        { key: "User", value: "user" },
        { key: "Driver", value: "driver" },
    ];

    const sentimentOptions = [
        { key: "Positive", value: "positive", color: "#10B981", bg: "#ECFDF5" },
        { key: "Neutral", value: "neutral", color: "#F59E0B", bg: "#FFFBEB" },
        { key: "Negative", value: "negative", color: "#EF4444", bg: "#FEF2F2" },
    ];

    const [currentFeedback, setCurrentFeedback] = useState<{
        id: any;
        name: string;
        target_type: string;
        sentiment: string;
    }>({
        id: "",
        name: "",
        target_type: "user",
        sentiment: "positive",
    });

    const openUpdateModal = (item: any) => {
        setCurrentFeedback({
            id: item.id,
            name: item.name,
            target_type: item.target_type,
            sentiment: item.sentiment,
        });
        setModalVisible(true);
    };

    const confirmDelete = (id: any, name: string) => {
        Alert.alert(
            "Delete Tag",
            `Are you sure you want to delete feedback tag "${name}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => deleteFeedback(id),
                },
            ]
        );
    };

    const deleteFeedback = async (id: any) => {
        setLoading(true);
        try {
            const res = await DeleteFeedbackService(id);
            const { data: { message = "", success = false } = {} } = res || {};
            if (success === true) {
                showSuccess(message || "Feedback tag removed");
                fetchFeedbackList();
            } else {
                showError(message || "Failed to remove tag");
            }
        } catch (error) {
            showError("Failed to delete tag");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateFeedback = async () => {
        if (!currentFeedback.name.trim()) {
            showError("Tag name cannot be empty");
            return;
        }

        setUpdating(true);
        const payload = {
            name: currentFeedback.name.trim(),
            target_type: currentFeedback.target_type,
            sentiment: currentFeedback.sentiment,
            is_active: 1,
        };

        try {
            const res = await UpdateFeedbackService(currentFeedback.id, payload);
            const { data: { message = "", success = false } = {} } = res || {};

            if (success === true) {
                showSuccess(message || "Tag updated successfully");
                setModalVisible(false);
                fetchFeedbackList();
            } else {
                showError(message || "Failed to update tag");
            }
        } catch (error) {
            showError("Failed to update tag");
        } finally {
            setUpdating(false);
        }
    };

    const fetchFeedbackList = async () => {
        setLoading(true);
        try {
            const res = await GetFeedbackService();
            const { data: { data = [], message = "", success = false } = {} } = res || {};
            if (success) {
                setFeedbackList(data);
            } else {
                showError(message || "Failed to fetch tags");
            }
        } catch (error) {
            showError("Failed to fetch tags");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbackList();
    }, []);

    const getSentimentBadge = (sentiment: string) => {
        const match = sentimentOptions.find((s) => s.value === (sentiment || "").toLowerCase());
        if (match) {
            return {
                label: match.key,
                color: match.color,
                bg: match.bg,
            };
        }
        return {
            label: sentiment || "Unknown",
            color: "#64748B",
            bg: "#F1F5F9",
        };
    };

    return (
        <View style={styles.container}>
            <Header value={value} subtitle="Manage Trip Rating Tags" />

            <View style={styles.content}>
                {loading && feedBackList.length === 0 ? (
                    <View style={styles.centerLoader}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loaderText}>Loading feedback tags...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={feedBackList}
                        keyExtractor={(item) => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                        removeClippedSubviews={false}
                        renderItem={({ item }) => {
                            const badge = getSentimentBadge(item?.sentiment);
                            const isDriver = (item?.target_type || "").toLowerCase() === "driver";

                            return (
                                <View style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.tagIconWrapper}>
                                            <Ionicons name="pricetag" size={18} color="#E11D48" />
                                        </View>
                                        <View style={styles.titleInfo}>
                                            <Text style={styles.tagName}>{item.name}</Text>
                                            <View style={styles.badgesRow}>
                                                <View style={styles.targetBadge}>
                                                    <Text style={styles.targetBadgeText}>
                                                        {isDriver ? "Fleet Driver" : "Customer"}
                                                    </Text>
                                                </View>
                                                <View
                                                    style={[
                                                        styles.sentimentBadge,
                                                        { backgroundColor: badge.bg },
                                                    ]}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.sentimentBadgeText,
                                                            { color: badge.color },
                                                        ]}
                                                    >
                                                        {badge.label}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>

                                    <View style={styles.actionsRow}>
                                        <TouchableOpacity
                                            onPress={() => openUpdateModal(item)}
                                            style={styles.editButton}
                                            activeOpacity={0.8}
                                        >
                                            <Ionicons name="create-outline" size={15} color="#2563EB" style={styles.btnIcon} />
                                            <Text style={styles.editButtonText}>Edit</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => confirmDelete(item?.id, item.name)}
                                            style={styles.deleteButton}
                                            activeOpacity={0.8}
                                        >
                                            <Ionicons name="trash-outline" size={15} color="#DC2626" style={styles.btnIcon} />
                                            <Text style={styles.deleteButtonText}>Delete</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        }}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="chatbubbles-outline" size={54} color="#CBD5E1" />
                                <Text style={styles.emptyTitle}>No Feedback Tags Found</Text>
                                <Text style={styles.emptySubtitle}>
                                    There are currently no configured rating tags.
                                </Text>
                            </View>
                        }
                    />
                )}
            </View>

            {/* Edit Modal */}
            <Modal
                visible={modalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Update Feedback Tag</Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Ionicons name="close" size={22} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalLabel}>Tag Name</Text>
                        <TextInput
                            value={currentFeedback.name}
                            onChangeText={(text) => setCurrentFeedback({ ...currentFeedback, name: text })}
                            placeholder="Enter tag label"
                            placeholderTextColor="#94A3B8"
                            style={styles.modalInput}
                        />

                        <Text style={styles.modalLabel}>Target Audience</Text>
                        <View style={styles.modalTargetsRow}>
                            {targetTypeOptions.map((opt) => {
                                const isSel = currentFeedback.target_type === opt.value;
                                return (
                                    <TouchableOpacity
                                        key={opt.value}
                                        onPress={() =>
                                            setCurrentFeedback({
                                                ...currentFeedback,
                                                target_type: opt.value,
                                            })
                                        }
                                        style={[
                                            styles.modalTargetBtn,
                                            isSel && styles.modalTargetBtnSelected,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.modalTargetText,
                                                isSel && styles.modalTargetTextSelected,
                                            ]}
                                        >
                                            {opt.key}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <Text style={styles.modalLabel}>Sentiment</Text>
                        <View style={styles.modalSentimentsRow}>
                            {sentimentOptions.map((opt) => {
                                const isSel = currentFeedback.sentiment === opt.value;
                                return (
                                    <TouchableOpacity
                                        key={opt.value}
                                        onPress={() =>
                                            setCurrentFeedback({
                                                ...currentFeedback,
                                                sentiment: opt.value,
                                            })
                                        }
                                        style={[
                                            styles.modalSentimentBtn,
                                            { backgroundColor: isSel ? opt.color : opt.bg },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.modalSentimentText,
                                                { color: isSel ? "#FFFFFF" : opt.color },
                                            ]}
                                        >
                                            {opt.key}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <View style={styles.modalActionsRow}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalSaveButton, updating && styles.modalSaveButtonDisabled]}
                                onPress={handleUpdateFeedback}
                                disabled={updating}
                            >
                                {updating ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.modalSaveText}>Save Changes</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default FeedbackList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 14,
    },
    listContent: {
        paddingBottom: 40,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    tagIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#FFE4E6",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    titleInfo: {
        flex: 1,
    },
    tagName: {
        fontSize: 15,
        fontWeight: "700",
        color: COLORS.textMain,
        marginBottom: 4,
    },
    badgesRow: {
        flexDirection: "row",
        gap: 6,
    },
    targetBadge: {
        backgroundColor: "#F1F5F9",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    targetBadgeText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#64748B",
    },
    sentimentBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    sentimentBadgeText: {
        fontSize: 11,
        fontWeight: "700",
    },
    actionsRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 14,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    editButton: {
        flex: 1,
        height: 38,
        borderRadius: 10,
        backgroundColor: "#EFF6FF",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#BFDBFE",
    },
    editButtonText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#2563EB",
    },
    deleteButton: {
        flex: 1,
        height: 38,
        borderRadius: 10,
        backgroundColor: "#FEF2F2",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#FECACA",
    },
    deleteButtonText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#DC2626",
    },
    btnIcon: {
        marginRight: 5,
    },
    centerLoader: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    loaderText: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginTop: 10,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.textMain,
        marginTop: 12,
    },
    emptySubtitle: {
        fontSize: 13,
        color: COLORS.textMuted,
        textAlign: "center",
        marginTop: 6,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalCard: {
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 20,
        ...SHADOWS.lg,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: COLORS.textMain,
    },
    modalLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: COLORS.textSecondary,
        marginBottom: 6,
    },
    modalInput: {
        height: 48,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 12,
        fontSize: 15,
        color: COLORS.textMain,
        backgroundColor: "#F8FAFC",
        marginBottom: 14,
    },
    modalTargetsRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 14,
    },
    modalTargetBtn: {
        flex: 1,
        height: 40,
        borderRadius: 10,
        backgroundColor: "#F1F5F9",
        alignItems: "center",
        justifyContent: "center",
    },
    modalTargetBtnSelected: {
        backgroundColor: COLORS.primary,
    },
    modalTargetText: {
        fontSize: 13,
        fontWeight: "600",
        color: COLORS.textSecondary,
    },
    modalTargetTextSelected: {
        color: "#FFFFFF",
        fontWeight: "700",
    },
    modalSentimentsRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 20,
    },
    modalSentimentBtn: {
        flex: 1,
        height: 38,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    modalSentimentText: {
        fontSize: 12,
        fontWeight: "700",
    },
    modalActionsRow: {
        flexDirection: "row",
        gap: 12,
    },
    modalCancelButton: {
        flex: 1,
        height: 46,
        borderRadius: 12,
        backgroundColor: "#F1F5F9",
        alignItems: "center",
        justifyContent: "center",
    },
    modalCancelText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#64748B",
    },
    modalSaveButton: {
        flex: 1,
        height: 46,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    modalSaveButtonDisabled: {
        opacity: 0.7,
    },
    modalSaveText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#FFFFFF",
    },
});