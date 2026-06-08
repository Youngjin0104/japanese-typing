import React from "react";
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { C } from "../styles/colors.js";
import { shadow } from "../styles/theme.js";

async function saveCrashLog(error, info) {
  try {
    const raw  = await AsyncStorage.getItem("jta:crash:log");
    const logs = raw ? JSON.parse(raw) : [];
    const entry = {
      ts:        new Date().toISOString(),
      message:   error?.message ?? String(error),
      stack:     error?.stack?.slice(0, 600) ?? "",
      component: info?.componentStack?.slice(0, 300) ?? "",
    };
    await AsyncStorage.setItem(
      "jta:crash:log",
      JSON.stringify([entry, ...logs].slice(0, 10))
    );
  } catch {}
}

// ─────────────────────────────────────────────
// 🛡️ ErrorBoundary (RN)
// ─────────────────────────────────────────────
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    saveCrashLog(error, info);
    this.props.onError?.(error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, showDetails: false });
    this.props.onReset?.();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, showDetails: false });
    this.props.onGoHome?.();
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    const { error, showDetails } = this.state;
    const { fallbackLabel = "화면" } = this.props;

    return (
      <ScrollView
        contentContainerStyle={s.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.iconBox}>
          <Text style={s.icon}>⚠️</Text>
        </View>
        <Text style={s.title}>앗, 문제가 생겼어요</Text>
        <Text style={s.subtitle}>
          {fallbackLabel}을(를) 불러오는 중{"\n"}오류가 발생했습니다.
        </Text>
        <View style={s.btnGroup}>
          <TouchableOpacity style={s.primaryBtn} onPress={this.handleRetry} activeOpacity={0.82}>
            <Text style={s.primaryBtnText}>🔄 다시 시도</Text>
          </TouchableOpacity>
          {this.props.onGoHome && (
            <TouchableOpacity style={s.secondaryBtn} onPress={this.handleGoHome} activeOpacity={0.82}>
              <Text style={s.secondaryBtnText}>🏠 처음으로</Text>
            </TouchableOpacity>
          )}
        </View>
        {__DEV__ && (
          <>
            <TouchableOpacity
              style={s.detailToggle}
              onPress={() => this.setState(st => ({ showDetails: !st.showDetails }))}
            >
              <Text style={s.detailToggleText}>
                {showDetails ? "▲ 숨기기" : "▼ 개발자 정보"}
              </Text>
            </TouchableOpacity>
            {showDetails && (
              <View style={s.errorBox}>
                <Text style={s.errorTitle} selectable>
                  {error?.name}: {error?.message}
                </Text>
                <Text style={s.errorStack} selectable>
                  {error?.stack?.slice(0, 800)}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    );
  }
}

const s = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    paddingTop: 60,
  },
  iconBox: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: `${C.accent}14`,
    borderWidth: 2, borderColor: `${C.accent}30`,
    alignItems: "center", justifyContent: "center",
    marginBottom: 22,
  },
  icon:     { fontSize: 38 },
  title:    { fontSize: 22, fontWeight: "700", color: C.text, marginBottom: 10, textAlign: "center" },
  subtitle: { fontSize: 14, color: C.dim, textAlign: "center", lineHeight: 22, marginBottom: 32, fontFamily: "NotoSansKR-Regular" },
  btnGroup: { width: "100%", maxWidth: 340, gap: 10, marginBottom: 24 },
  primaryBtn:      { backgroundColor: C.accent, borderRadius: 14, paddingVertical: 15, alignItems: "center", ...shadow(1) },
  primaryBtnText:  { color: "#fff", fontSize: 16, fontWeight: "700", fontFamily: "NotoSansKR-Bold" },
  secondaryBtn:    { borderWidth: 2, borderColor: C.border, borderRadius: 14, paddingVertical: 14, alignItems: "center", backgroundColor: C.card },
  secondaryBtnText:{ color: C.text, fontSize: 15, fontFamily: "NotoSansKR-Medium" },
  detailToggle:     { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 99, backgroundColor: `${C.gold}14`, borderWidth: 1, borderColor: `${C.gold}30`, marginBottom: 12 },
  detailToggleText: { fontSize: 12, color: C.gold, fontWeight: "600" },
  errorBox:   { width: "100%", maxWidth: 360, backgroundColor: "#1a1a1a", borderRadius: 12, padding: 16 },
  errorTitle: { color: "#ff6b6b", fontSize: 12, fontWeight: "700", marginBottom: 8, fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }) },
  errorStack: { color: "#d4d4d4", fontSize: 10, lineHeight: 16, fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }) },
});

export default ErrorBoundary;
