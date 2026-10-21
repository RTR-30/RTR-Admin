import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Linking,
    Modal,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import Header from "../../../Common/PageHeader";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import { COLORS, SHADOWS } from "../../../utils/ColorCode";
import { getContactUsService, updateContactUsService } from "./helper";

interface ContactDataItem {
    id: string;
    title: string;
    description: string;
}

const ContactUs = () => {
    const value = "Contact Us";
    const [selectedAppType, setSelectedAppType] = useState<"user" | "partner">("user");
    const [loading, setLoading] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    // Pure API Data States (Zero Static / Fallback Data)
    const [heading, setHeading] = useState<string>("");
    const [content, setContent] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [mail, setMail] = useState<string>("");
    const [whatsapp, setWhatsapp] = useState<string>("");
    const [insta, setInsta] = useState<string>("");
    const [dataItems, setDataItems] = useState<ContactDataItem[]>([]);
    const [apiLoaded, setApiLoaded] = useState<boolean>(false);

    // Edit modal states
    const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
    const [editHeading, setEditHeading] = useState<string>("");
    const [editContent, setEditContent] = useState<string>("");
    const [editPhone, setEditPhone] = useState<string>("");
    const [editMail, setEditMail] = useState<string>("");
    const [editWhatsapp, setEditWhatsapp] = useState<string>("");
    const [editInsta, setEditInsta] = useState<string>("");
    const [editDataItems, setEditDataItems] = useState<ContactDataItem[]>([]);
    const [saving, setSaving] = useState<boolean>(false);

    const fetchContactDetails = async (appType: "user" | "partner", isRefresh: boolean = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const res = await getContactUsService(appType);
            const raw = res?.data;
            let resObj: any = raw;
            if (raw?.data && !Array.isArray(raw.data) && typeof raw.data === "object") {
                resObj = raw.data;
            } else {
                resObj = raw;
            }

            setHeading("");
            setContent("");
            setPhone("");
            setMail("");
            setWhatsapp("");
            setInsta("");
            setDataItems([]);
            setApiLoaded(true);

            if (resObj && typeof resObj === "object") {
                setHeading(resObj?.heading ?? resObj?.title ?? "");
                setContent(resObj?.content ?? resObj?.description ?? "");

                const contactObj = resObj?.contact && typeof resObj.contact === "object" ? resObj.contact : {};
                setPhone(contactObj?.phone ?? resObj?.phone ?? resObj?.mobile ?? resObj?.phone_number ?? "");
                setMail(contactObj?.mail ?? resObj?.mail ?? resObj?.email ?? resObj?.support_email ?? "");
                setWhatsapp(contactObj?.whatsapp ?? resObj?.whatsapp ?? resObj?.whatsapp_number ?? "");
                setInsta(contactObj?.insta ?? resObj?.insta ?? resObj?.instagram ?? "");

                let items: any[] = [];
                if (Array.isArray(resObj?.data)) {
                    items = resObj.data;
                } else if (Array.isArray(raw?.data)) {
                    items = raw.data;
                } else if (Array.isArray(resObj?.locations)) {
                    items = resObj.locations;
                }

                const parsedData: ContactDataItem[] = items.map((item: any, idx: number) => ({
                    id: String(item?._id ?? item?.id ?? idx),
                    title: item?.title ?? "",
                    description: item?.description ?? item?.address ?? (typeof item === "string" ? item : ""),
                }));
                setDataItems(parsedData);
            }
        } catch (error: any) {
            setHeading("");
            setContent("");
            setPhone("");
            setMail("");
            setWhatsapp("");
            setInsta("");
            setDataItems([]);
            setApiLoaded(true);
            showError(error?.message || "Failed to load contact info from server");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchContactDetails(selectedAppType);
    }, [selectedAppType]);

    const onRefresh = () => {
        fetchContactDetails(selectedAppType, true);
    };

    const handleCall = () => {
        if (!phone) return;
        const cleanNumber = phone.replace(/[^0-9+]/g, "");
        const url = `tel:${cleanNumber}`;
        Linking.canOpenURL(url)
            .then((supported) => {
                if (supported) {
                    Linking.openURL(url);
                } else {
                    Alert.alert("Unable to Call", `Please dial: ${phone}`);
                }
            })
            .catch(() => {
                Alert.alert("Dial Error", `Number: ${phone}`);
            });
    };

    const handleWhatsApp = () => {
        if (!whatsapp) return;
        const cleanNumber = whatsapp.replace(/[^0-9]/g, "");
        const msg = encodeURIComponent(`Hello Drive4U Support, reaching out regarding ${selectedAppType} app.`);
        const url = `https://wa.me/${cleanNumber}?text=${msg}`;
        Linking.canOpenURL(url)
            .then((supported) => {
                if (supported) {
                    Linking.openURL(url);
                } else {
                    Alert.alert("WhatsApp Unavailable", `Number: ${whatsapp}`);
                }
            })
            .catch(() => {
                Alert.alert("Error", `Cannot open WhatsApp for ${whatsapp}`);
            });
    };

    const handleEmail = () => {
        if (!mail) return;
        const url = `mailto:${mail}?subject=RTR%20Admin%20Support%20(${selectedAppType})`;
        Linking.canOpenURL(url)
            .then((supported) => {
                if (supported) {
                    Linking.openURL(url);
                } else {
                    Alert.alert("Email Unavailable", `Email: ${mail}`);
                }
            })
            .catch(() => {
                Alert.alert("Error", `Cannot open email for ${mail}`);
            });
    };

    const handleInstagram = () => {
        if (!insta) return;
        const url = insta.startsWith("http") ? insta : `https://${insta}`;
        Linking.canOpenURL(url)
            .then((supported) => {
                if (supported) {
                    Linking.openURL(url);
                } else {
                    Alert.alert("Unable to open URL", insta);
                }
            })
            .catch(() => {
                Alert.alert("Error", `Cannot open: ${insta}`);
            });
    };

    const handleOpenMap = (address: string) => {
        if (!address) return;
        const query = encodeURIComponent(address);
        const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
        Linking.openURL(url).catch(() => {
            Alert.alert("Error", "Could not open map");
        });
    };

    const handleOpenEdit = () => {
        setEditHeading(heading || "");
        setEditContent(content || "");
        setEditPhone(phone || "");
        setEditMail(mail || "");
        setEditWhatsapp(whatsapp || "");
        setEditInsta(insta || "");
        setEditDataItems(dataItems.length > 0 ? [...dataItems] : []);
        setIsEditModalVisible(true);
    };

    const handleAddDataItem = () => {
        setEditDataItems((prev) => [
            ...prev,
            {
                id: Date.now().toString(),
                title: "",
                description: "",
            },
        ]);
    };

    const handleRemoveDataItem = (id: string) => {
        setEditDataItems((prev) => prev.filter((item) => item.id !== id));
    };

    const handleDataItemChange = (index: number, field: "title" | "description", val: string) => {
        setEditDataItems((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: val };
            return next;
        });
    };

    const handleSaveContact = async () => {
        if (!editHeading.trim()) {
            showError("Please enter a heading");
            return;
        }

        const validData = editDataItems.filter(
            (item) => item.title.trim().length > 0 || item.description.trim().length > 0
        );

        // Exact PUT payload contract requested
        const payload = {
            app_type: selectedAppType,
            heading: editHeading.trim(),
            content: editContent.trim(),
            phone: editPhone.trim(),
            mail: editMail.trim(),
            whatsapp: editWhatsapp.trim(),
            insta: editInsta.trim(),
            contact: {
                phone: editPhone.trim(),
                mail: editMail.trim(),
                whatsapp: editWhatsapp.trim(),
                insta: editInsta.trim(),
            },
            data: validData.map((item) => ({
                title: item.title.trim(),
                description: item.description.trim(),
            })),
        };

        setSaving(true);
        try {
            const res = await updateContactUsService(payload);
            const { data: { success = false, message = "" } = {} } = res || {};

            if (success === true || res?.status === 200 || res?.status === 201) {
                showSuccess(message || "Contact info updated successfully on server");
                setIsEditModalVisible(false);
                fetchContactDetails(selectedAppType);
            } else {
                showError(message || "Failed to update contact info on server");
            }
        } catch (error: any) {
            showError(error?.message || "Failed to save contact info to server");
        } finally {
            setSaving(false);
        }
    };

    const hasChannels =
        phone.trim().length > 0 ||
        mail.trim().length > 0 ||
        whatsapp.trim().length > 0 ||
        insta.trim().length > 0;

    const hasData =
        heading.trim().length > 0 ||
        content.trim().length > 0 ||
        hasChannels ||
        dataItems.length > 0;

    return (
        <View style={styles.container}>
            <Header value={value} subtitle="Live Contact Details Synced with API" />

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
                        <Ionicons name="cloud-done-outline" size={22} color="#16A34A" />
                    </View>
                    <View style={styles.apiBannerText}>
                        <Text style={styles.apiBannerTitle}>
                            API Source: /content/contact-us?app_type={selectedAppType}
                        </Text>
                        <Text style={styles.apiBannerSubtitle}>
                            {hasData ? "Displaying live server contact channels" : "Awaiting data from server"}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={handleOpenEdit}
                        activeOpacity={0.75}
                    >
                        <Ionicons name="create-outline" size={14} color="#16A34A" />
                        <Text style={styles.editButtonText}>{hasData ? "Edit" : "Create"}</Text>
                    </TouchableOpacity>
                </View>

                {/* Content Renderers */}
                {loading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loaderText}>Fetching contact info from server...</Text>
                    </View>
                ) : !hasData && apiLoaded ? (
                    /* Clean Empty State when API has no data */
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconBox}>
                            <Ionicons name="headset-outline" size={44} color="#94A3B8" />
                        </View>
                        <Text style={styles.emptyTitle}>No Contact Details Found</Text>
                        <Text style={styles.emptySubtitle}>
                            The server returned no contact information for app_type="{selectedAppType}".
                        </Text>
                        <View style={styles.emptyActionRow}>
                            <TouchableOpacity
                                style={styles.emptyRefreshButton}
                                onPress={() => fetchContactDetails(selectedAppType)}
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
                                <Text style={styles.emptyAddButtonText}>Configure Contact</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : hasData ? (
                    <View>
                        {/* Heading & Intro Card */}
                        {(heading.trim().length > 0 || content.trim().length > 0) && (
                            <View style={styles.mainInfoCard}>
                                <View style={styles.mainInfoHeader}>
                                    <View style={styles.headerLeft}>
                                        {heading.trim().length > 0 && (
                                            <Text style={styles.headingTitle}>{heading}</Text>
                                        )}
                                        <View style={styles.typeBadge}>
                                            <Text style={styles.typeBadgeText}>
                                                {selectedAppType.toUpperCase()} APP
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.cardEditAction}
                                        onPress={handleOpenEdit}
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons name="create-outline" size={16} color="#16A34A" />
                                    </TouchableOpacity>
                                </View>

                                {content.trim().length > 0 && (
                                    <Text style={styles.contentDescription}>{content}</Text>
                                )}
                            </View>
                        )}

                        {/* Direct Channels List */}
                        {hasChannels && (
                            <View>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Direct Communication Channels</Text>
                                </View>

                                <View style={styles.channelsGrid}>
                                    {/* Phone */}
                                    {phone.trim().length > 0 && (
                                        <TouchableOpacity
                                            style={styles.channelCard}
                                            onPress={handleCall}
                                            activeOpacity={0.8}
                                        >
                                            <View style={[styles.channelIconBox, { backgroundColor: "#DCFCE7" }]}>
                                                <Ionicons name="call" size={20} color="#16A34A" />
                                            </View>
                                            <View style={styles.channelTextWrapper}>
                                                <Text style={styles.channelLabel}>PHONE</Text>
                                                <Text style={styles.channelValue}>{phone}</Text>
                                            </View>
                                            <View style={styles.channelArrow}>
                                                <Ionicons name="chevron-forward" size={16} color="#16A34A" />
                                            </View>
                                        </TouchableOpacity>
                                    )}

                                    {/* Mail */}
                                    {mail.trim().length > 0 && (
                                        <TouchableOpacity
                                            style={styles.channelCard}
                                            onPress={handleEmail}
                                            activeOpacity={0.8}
                                        >
                                            <View style={[styles.channelIconBox, { backgroundColor: "#FEF3C7" }]}>
                                                <Ionicons name="mail" size={20} color="#D97706" />
                                            </View>
                                            <View style={styles.channelTextWrapper}>
                                                <Text style={styles.channelLabel}>EMAIL (MAIL)</Text>
                                                <Text style={styles.channelValue}>{mail}</Text>
                                            </View>
                                            <View style={styles.channelArrow}>
                                                <Ionicons name="chevron-forward" size={16} color="#D97706" />
                                            </View>
                                        </TouchableOpacity>
                                    )}

                                    {/* WhatsApp */}
                                    {whatsapp.trim().length > 0 && (
                                        <TouchableOpacity
                                            style={styles.channelCard}
                                            onPress={handleWhatsApp}
                                            activeOpacity={0.8}
                                        >
                                            <View style={[styles.channelIconBox, { backgroundColor: "#E0F2FE" }]}>
                                                <Ionicons name="logo-whatsapp" size={20} color="#0284C7" />
                                            </View>
                                            <View style={styles.channelTextWrapper}>
                                                <Text style={styles.channelLabel}>WHATSAPP</Text>
                                                <Text style={styles.channelValue}>{whatsapp}</Text>
                                            </View>
                                            <View style={styles.channelArrow}>
                                                <Ionicons name="chevron-forward" size={16} color="#0284C7" />
                                            </View>
                                        </TouchableOpacity>
                                    )}

                                    {/* Instagram */}
                                    {insta.trim().length > 0 && (
                                        <TouchableOpacity
                                            style={styles.channelCard}
                                            onPress={handleInstagram}
                                            activeOpacity={0.8}
                                        >
                                            <View style={[styles.channelIconBox, { backgroundColor: "#FFE4E6" }]}>
                                                <Ionicons name="logo-instagram" size={20} color="#E11D48" />
                                            </View>
                                            <View style={styles.channelTextWrapper}>
                                                <Text style={styles.channelLabel}>INSTAGRAM</Text>
                                                <Text style={styles.channelValue} numberOfLines={1}>
                                                    {insta}
                                                </Text>
                                            </View>
                                            <View style={styles.channelArrow}>
                                                <Ionicons name="chevron-forward" size={16} color="#E11D48" />
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        )}

                        {/* Additional Information from "data" */}
                        {dataItems.length > 0 && (
                            <View style={styles.additionalSection}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>
                                        Additional Information ({dataItems.length})
                                    </Text>
                                </View>

                                {dataItems.map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={styles.dataCard}
                                        onPress={() => (item.description ? handleOpenMap(item.description) : null)}
                                        activeOpacity={0.85}
                                    >
                                        <View style={styles.dataIconBox}>
                                            <Ionicons name="information-circle-outline" size={20} color="#0284C7" />
                                        </View>
                                        <View style={styles.dataContent}>
                                            {item.title.trim().length > 0 && (
                                                <Text style={styles.dataTitle}>{item.title}</Text>
                                            )}
                                            {item.description.trim().length > 0 && (
                                                <Text style={styles.dataDesc}>{item.description}</Text>
                                            )}
                                        </View>
                                        {item.description.trim().length > 0 && (
                                            <Ionicons name="navigate-outline" size={16} color="#94A3B8" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                ) : null}
            </ScrollView>

            {/* Edit / Configure Modal */}
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
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <View style={styles.modalHeaderInfo}>
                                <Text style={styles.modalTitle}>
                                    {hasData ? "Edit Contact Information" : "Create Contact Information"}
                                </Text>
                                <Text style={styles.modalSubtitle}>
                                    Update contact info for {selectedAppType} app
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setIsEditModalVisible(false)}
                                style={styles.modalCloseButton}
                            >
                                <Ionicons name="close" size={22} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        {/* Modal Scroll Body */}
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.modalScrollBody}
                        >
                            {/* Heading */}
                            <Text style={styles.fieldLabel}>Heading</Text>
                            <TextInput
                                value={editHeading}
                                onChangeText={setEditHeading}
                                placeholder="Heading title..."
                                placeholderTextColor="#94A3B8"
                                style={styles.textInput}
                            />

                            {/* Content */}
                            <Text style={styles.fieldLabel}>Content Message</Text>
                            <TextInput
                                value={editContent}
                                onChangeText={setEditContent}
                                placeholder="Overview or support description..."
                                placeholderTextColor="#94A3B8"
                                multiline
                                numberOfLines={2}
                                textAlignVertical="top"
                                style={[styles.textInput, styles.textArea]}
                            />

                            {/* Phone */}
                            <Text style={styles.fieldLabel}>Phone Number</Text>
                            <TextInput
                                value={editPhone}
                                onChangeText={setEditPhone}
                                placeholder="Phone number..."
                                placeholderTextColor="#94A3B8"
                                keyboardType="phone-pad"
                                style={styles.textInput}
                            />

                            {/* Mail */}
                            <Text style={styles.fieldLabel}>Support Email (mail)</Text>
                            <TextInput
                                value={editMail}
                                onChangeText={setEditMail}
                                placeholder="Support email address..."
                                placeholderTextColor="#94A3B8"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                style={styles.textInput}
                            />

                            {/* WhatsApp */}
                            <Text style={styles.fieldLabel}>WhatsApp Number</Text>
                            <TextInput
                                value={editWhatsapp}
                                onChangeText={setEditWhatsapp}
                                placeholder="WhatsApp number..."
                                placeholderTextColor="#94A3B8"
                                keyboardType="phone-pad"
                                style={styles.textInput}
                            />

                            {/* Instagram */}
                            <Text style={styles.fieldLabel}>Instagram URL (insta)</Text>
                            <TextInput
                                value={editInsta}
                                onChangeText={setEditInsta}
                                placeholder="Instagram link or handle..."
                                placeholderTextColor="#94A3B8"
                                autoCapitalize="none"
                                style={styles.textInput}
                            />

                            {/* Additional Information / Data Header */}
                            <View style={styles.dataHeaderRow}>
                                <Text style={styles.dataSectionLabel}>
                                    Information Cards ({editDataItems.length})
                                </Text>
                                <TouchableOpacity
                                    style={styles.addDataLink}
                                    onPress={handleAddDataItem}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="add-circle" size={16} color={COLORS.primary} />
                                    <Text style={styles.addDataLinkText}>Add Card</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Dynamic Data Items */}
                            {editDataItems.length === 0 ? (
                                <View style={styles.noDataBox}>
                                    <Ionicons name="business-outline" size={28} color="#94A3B8" />
                                    <Text style={styles.noDataText}>No additional cards added yet</Text>
                                    <TouchableOpacity
                                        style={styles.addFirstDataButton}
                                        onPress={handleAddDataItem}
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons name="add-circle-outline" size={16} color={COLORS.primary} />
                                        <Text style={styles.addFirstDataButtonText}>Add First Card</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                editDataItems.map((item, index) => (
                                    <View key={item.id} style={styles.dataInputCard}>
                                        <View style={styles.dataInputHeader}>
                                            <Text style={styles.dataIndexText}>
                                                Card #{index + 1}
                                            </Text>
                                            <TouchableOpacity
                                                onPress={() => handleRemoveDataItem(item.id)}
                                                activeOpacity={0.7}
                                                style={styles.removeDataButton}
                                            >
                                                <Ionicons name="trash-outline" size={16} color="#DC2626" />
                                            </TouchableOpacity>
                                        </View>

                                        <TextInput
                                            value={item.title}
                                            onChangeText={(val) =>
                                                handleDataItemChange(index, "title", val)
                                            }
                                            placeholder="Card Title (e.g. Head Office, Emergency SOS)"
                                            placeholderTextColor="#94A3B8"
                                            style={styles.dataTitleInput}
                                        />

                                        <TextInput
                                            value={item.description}
                                            onChangeText={(val) =>
                                                handleDataItemChange(index, "description", val)
                                            }
                                            placeholder="Card Description / Office Address..."
                                            placeholderTextColor="#94A3B8"
                                            multiline
                                            numberOfLines={2}
                                            textAlignVertical="top"
                                            style={styles.dataDescInput}
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
                                onPress={handleSaveContact}
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

export default ContactUs;

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
        backgroundColor: "#DCFCE7",
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
        backgroundColor: "#F0FDF4",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#BBF7D0",
    },
    editButtonText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#16A34A",
        marginLeft: 4,
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
    mainInfoCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 16,
        ...SHADOWS.sm,
    },
    mainInfoHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
    },
    headerLeft: {
        flex: 1,
    },
    headingTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: COLORS.textMain,
    },
    typeBadge: {
        backgroundColor: "#DCFCE7",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        alignSelf: "flex-start",
        marginTop: 4,
    },
    typeBadgeText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#166534",
    },
    cardEditAction: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: "#F0FDF4",
        alignItems: "center",
        justifyContent: "center",
    },
    contentDescription: {
        fontSize: 13,
        color: "#475569",
        lineHeight: 20,
        marginTop: 10,
    },
    sectionHeader: {
        marginBottom: 10,
        paddingHorizontal: 2,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: "800",
        color: COLORS.textMain,
        letterSpacing: 0.2,
    },
    channelsGrid: {
        gap: 10,
        marginBottom: 16,
    },
    channelCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    channelIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    channelTextWrapper: {
        flex: 1,
    },
    channelLabel: {
        fontSize: 10,
        fontWeight: "700",
        color: COLORS.textMuted,
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    channelValue: {
        fontSize: 13,
        fontWeight: "700",
        color: COLORS.textMain,
    },
    channelArrow: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: "#F8FAFC",
        alignItems: "center",
        justifyContent: "center",
    },
    additionalSection: {
        marginTop: 4,
    },
    dataCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 10,
        ...SHADOWS.sm,
    },
    dataIconBox: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: "#E0F2FE",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    dataContent: {
        flex: 1,
        paddingRight: 8,
    },
    dataTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: COLORS.textMain,
    },
    dataDesc: {
        fontSize: 12,
        color: "#64748B",
        lineHeight: 18,
        marginTop: 2,
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
        height: 56,
    },
    dataHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 14,
        marginBottom: 10,
    },
    dataSectionLabel: {
        fontSize: 12,
        fontWeight: "800",
        color: COLORS.textMain,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    addDataLink: {
        flexDirection: "row",
        alignItems: "center",
    },
    addDataLinkText: {
        fontSize: 12,
        fontWeight: "700",
        color: COLORS.primary,
        marginLeft: 4,
    },
    noDataBox: {
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
    noDataText: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 6,
        marginBottom: 10,
    },
    addFirstDataButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F0F9FF",
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#BAE6FD",
    },
    addFirstDataButtonText: {
        fontSize: 12,
        fontWeight: "700",
        color: COLORS.primary,
        marginLeft: 6,
    },
    dataInputCard: {
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        marginBottom: 10,
    },
    dataInputHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    dataIndexText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#0284C7",
    },
    removeDataButton: {
        padding: 2,
    },
    dataTitleInput: {
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
    dataDescInput: {
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
});
