import { Route } from "react-router-dom";
import { lazy } from "react";

const DailyPulse = lazy(() => import("@/pages/DailyPulse"));
const DesktopPage = lazy(() => import("@/pages/DesktopPage"));
const UserProfilePage = lazy(() => import("@/pages/UserProfilePage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const MyPlanUsage = lazy(() => import("@/pages/settings/MyPlanUsage"));
const AccessibilitySettings = lazy(() => import("@/pages/settings/AccessibilitySettings"));
const DeviceSettingsPage = lazy(() => import("@/pages/settings/DeviceSettings"));
const TrustedDeviceManager = lazy(() => import("@/pages/settings/TrustedDeviceManager"));
const MFAEnrollment = lazy(() => import("@/pages/settings/MFAEnrollment"));
const PasskeyManagement = lazy(() => import("@/pages/settings/PasskeyManagement"));
const MissionControl = lazy(() => import("@/pages/mission-control/MissionControlPage"));
const PersonalizationStudio = lazy(() => import("@/pages/PersonalizationStudio"));
const MemoryCenter = lazy(() => import("@/pages/MemoryCenter"));
const LifeDashboard = lazy(() => import("@/pages/LifeDashboard"));
const LifeSimulator = lazy(() => import("@/pages/LifeSimulator"));
const PersonalLifeWorkspace = lazy(() => import("@/pages/PersonalLifeWorkspace"));
const DownloadsCenter = lazy(() => import("@/pages/DownloadsCenter"));
const StorageManager = lazy(() => import("@/pages/StorageManager"));
const NetworkUtility = lazy(() => import("@/pages/NetworkUtility"));
const PlanningCanvas = lazy(() => import("@/pages/PlanningCanvas"));
const MyActivity = lazy(() => import("@/pages/MyActivity"));
const WealthCommandCenter = lazy(() => import("@/pages/WealthCommandCenter"));
const TimeMachinePage = lazy(() => import("@/pages/TimeMachinePage"));
const AchievementsPage = lazy(() => import("@/pages/AchievementsPage"));
const SimulationEnginePage = lazy(() => import("@/pages/SimulationEnginePage"));
const SearchPage = lazy(() => import("@/pages/SearchPage"));
const SystemStatus = lazy(() => import("@/pages/SystemStatus"));
const AutomationCenter = lazy(() => import("@/pages/AutomationCenter"));
const FirstBootSetup = lazy(() => import("@/pages/FirstBootSetup"));
const InboxCapture = lazy(() => import("@/pages/InboxCapture"));
const ActivityStream = lazy(() => import("@/pages/ActivityStream"));
const OpportunityEngine = lazy(() => import("@/pages/OpportunityEngine"));
const OutcomeEnginePage = lazy(() => import("@/pages/OutcomeEnginePage"));
const SpilloverDashboard = lazy(() => import("@/pages/SpilloverDashboard"));
const AIWorkforcePage = lazy(() => import("@/pages/AIWorkforcePage"));
const CapitalAllocationPage = lazy(() => import("@/pages/CapitalAllocationPage"));
const SovereignExportPage = lazy(() => import("@/pages/SovereignExportPage"));
const NotificationSettingsPage = lazy(() => import("@/pages/NotificationSettingsPage"));
const NotificationCenter = lazy(() => import("@/pages/NotificationCenter"));
const NotificationPreferences = lazy(() => import("@/pages/settings/NotificationPreferences"));
const PersonalBrain = lazy(() => import("@/pages/PersonalBrain"));
const PersonalBrainWorkspace = lazy(() => import("@/pages/personal-brain/PersonalBrainWorkspace"));
const PersonalBrainChat = lazy(() => import("@/pages/personal-brain/PersonalBrainChat"));
const BrainSnapshot = lazy(() => import("@/pages/personal-brain/BrainSnapshot"));
const BrainCommandCenter = lazy(() => import("@/pages/personal-brain/BrainCommandCenter"));
const PbVoiceSettings = lazy(() => import("@/pages/personal-brain/VoiceSettings"));
const PbToolsRegistry = lazy(() => import("@/pages/personal-brain/ToolsRegistry"));
const PbAcceptInvite = lazy(() => import("@/pages/personal-brain/AcceptInvite"));
const PbBrainSettings = lazy(() => import("@/pages/personal-brain/BrainSettings"));
const PbSecuritySettings = lazy(() => import("@/pages/personal-brain/SecuritySettings"));
const PbLearningSettings = lazy(() => import("@/pages/personal-brain/LearningSettings"));
const PbRetentionSettings = lazy(() => import("@/pages/personal-brain/RetentionSettings"));
const PbDataSettings = lazy(() => import("@/pages/personal-brain/DataSettings"));
const PbProfileSettings = lazy(() => import("@/pages/personal-brain/settings/ProfileSettings"));
const PbMemorySettings = lazy(() => import("@/pages/personal-brain/settings/MemorySettings"));
const PbModesSettings = lazy(() => import("@/pages/personal-brain/settings/ModesSettings"));
const PbWorkspacesSettings = lazy(() => import("@/pages/personal-brain/settings/WorkspacesSettings"));
const PbFilesSettings = lazy(() => import("@/pages/personal-brain/settings/FilesSettings"));
const PbNotificationsSettings = lazy(() => import("@/pages/personal-brain/settings/NotificationsSettings"));
const PbLabsSettings = lazy(() => import("@/pages/personal-brain/settings/LabsSettings"));
const CalmFocusMode = lazy(() => import("@/pages/CalmFocusMode"));
const CommandHistory = lazy(() => import("@/pages/CommandHistory"));
const EnvironmentSwitcherPage = lazy(() => import("@/pages/EnvironmentSwitcher"));
const UpdateCenterPage = lazy(() => import("@/pages/UpdateCenter"));
const CommunicationInbox = lazy(() => import("@/pages/CommunicationInbox"));
const RecoveryCenter = lazy(() => import("@/pages/RecoveryCenter"));
const ClipboardHistory = lazy(() => import("@/pages/ClipboardHistory"));
const PrintScanCenter = lazy(() => import("@/pages/PrintScanCenter"));
const CalendarWorkspace = lazy(() => import("@/pages/CalendarWorkspace"));
const NotesWorkspace = lazy(() => import("@/pages/NotesWorkspace"));
const PeopleWorkspace = lazy(() => import("@/pages/PeopleWorkspace"));
const TeamWorkspace = lazy(() => import("@/pages/TeamWorkspace"));
const TasksWorkflowsCenter = lazy(() => import("@/pages/TasksWorkflowsCenter"));
const DocumentEditor = lazy(() => import("@/pages/DocumentEditor"));
const ReportingWorkspace = lazy(() => import("@/pages/ReportingWorkspace"));
const MediaWorkspace = lazy(() => import("@/pages/MediaWorkspace"));
const TemplateCenter = lazy(() => import("@/pages/TemplateCenter"));
const ImportExportCenter = lazy(() => import("@/pages/ImportExportCenter"));
const PDFViewerWorkspace = lazy(() => import("@/pages/PDFViewerWorkspace"));
const SpreadsheetWorkspace = lazy(() => import("@/pages/SpreadsheetWorkspace"));
const EmailApp = lazy(() => import("@/pages/apps/EmailApp"));
const MessengerApp = lazy(() => import("@/pages/apps/MessengerApp"));
const VaultApp = lazy(() => import("@/pages/apps/VaultApp"));
const HealthApp = lazy(() => import("@/pages/apps/HealthApp"));
const GalleryApp = lazy(() => import("@/pages/apps/GalleryApp"));
const WeatherNewsApp = lazy(() => import("@/pages/apps/WeatherNewsApp"));
const Navigate = lazy(() => import("react-router-dom").then(m => ({ default: m.Navigate })));

// ── Intelligence Layer ──────────────────────────────────────
const IntelligenceDashboard = lazy(() => import("@/pages/intelligence/IntelligenceDashboard"));
const DeviceMeshPanel = lazy(() => import("@/pages/intelligence/DeviceMeshPanel"));
const PrivacyControlCenter = lazy(() => import("@/pages/intelligence/PrivacyControlCenter"));
const DownloadPage = lazy(() => import("@/pages/DownloadPage"));

export function getOSRoutes() {
  return (
    <>
      <Route path="/home" element={<DailyPulse />} />
      <Route path="/desktop" element={<DesktopPage />} />
      <Route path="/pulse" element={<DailyPulse />} />
      <Route path="/daily-pulse" element={<DailyPulse />} />
      <Route path="/profile" element={<UserProfilePage />} />
      <Route path="/life" element={<LifeDashboard />} />
      <Route path="/life-simulator" element={<LifeSimulator />} />
      <Route path="/personal-life" element={<PersonalLifeWorkspace />} />
      <Route path="/downloads" element={<DownloadsCenter />} />
      <Route path="/download" element={<DownloadPage />} />
      <Route path="/wealth-command" element={<WealthCommandCenter />} />
      <Route path="/time-machine" element={<TimeMachinePage />} />
      <Route path="/achievements" element={<AchievementsPage />} />
      <Route path="/simulation-engine" element={<SimulationEnginePage />} />
      <Route path="/storage" element={<StorageManager />} />
      <Route path="/network" element={<NetworkUtility />} />
      <Route path="/planning-canvas" element={<PlanningCanvas />} />
      <Route path="/my-activity" element={<MyActivity />} />
      <Route path="/search" element={<SearchPage />} />

      {/* Intelligence */}
      <Route path="/inbox" element={<InboxCapture />} />
      <Route path="/inbox/capture" element={<InboxCapture />} />
      <Route path="/inbox/processed" element={<InboxCapture />} />
      <Route path="/inbox/review" element={<InboxCapture />} />
      <Route path="/activity" element={<ActivityStream />} />
      <Route path="/opportunities" element={<OpportunityEngine />} />
      <Route path="/outcomes" element={<OutcomeEnginePage />} />
      <Route path="/spillovers" element={<SpilloverDashboard />} />
      <Route path="/ai-workforce" element={<AIWorkforcePage />} />
      <Route path="/capital-allocation" element={<CapitalAllocationPage />} />
      <Route path="/sovereign-export" element={<SovereignExportPage />} />
      <Route path="/notifications/settings" element={<NotificationSettingsPage />} />
      <Route path="/settings/notifications" element={<NotificationPreferences />} />
      <Route path="/notifications" element={<NotificationCenter />} />

      {/* Settings — canonical routes in settings-routes.tsx */}
      <Route path="/settings/billing" element={<SettingsPage />} />
      <Route path="/settings/privacy" element={<SettingsPage />} />
      <Route path="/settings/appearance" element={<SettingsPage />} />
      <Route path="/settings/plan-usage" element={<MyPlanUsage />} />
      <Route path="/settings/accessibility" element={<AccessibilitySettings />} />
      <Route path="/settings/device" element={<DeviceSettingsPage />} />
      <Route path="/settings/trusted-devices" element={<TrustedDeviceManager />} />
      <Route path="/settings/mfa" element={<MFAEnrollment />} />
      <Route path="/settings/passkey" element={<PasskeyManagement />} />

      {/* Personalization */}
      <Route path="/personalization" element={<PersonalizationStudio />} />
      <Route path="/personalization/profile" element={<PersonalizationStudio />} />
      <Route path="/personalization/preferences" element={<PersonalizationStudio />} />
      <Route path="/personalization/memory" element={<PersonalizationStudio />} />
      <Route path="/personalization/automation" element={<PersonalizationStudio />} />
      <Route path="/personalization/boardroom" element={<PersonalizationStudio />} />

      {/* Memory */}
      <Route path="/memory" element={<MemoryCenter />} />
      <Route path="/memory/profile" element={<MemoryCenter />} />
      <Route path="/memory/business" element={<MemoryCenter />} />
      <Route path="/memory/money" element={<MemoryCenter />} />
      <Route path="/memory/household" element={<MemoryCenter />} />
      <Route path="/memory/workflows" element={<MemoryCenter />} />
      <Route path="/memory/preferences" element={<MemoryCenter />} />

      {/* Automation */}
      <Route path="/automation" element={<AutomationCenter />} />
      <Route path="/automation/rules" element={<AutomationCenter />} />
      <Route path="/automation/trust" element={<AutomationCenter />} />
      <Route path="/automation/delegations" element={<AutomationCenter />} />

      {/* System */}
      <Route path="/system" element={<SystemStatus />} />
      <Route path="/system/trust" element={<SystemStatus />} />
      <Route path="/system/health" element={<SystemStatus />} />
      <Route path="/system/connectors" element={<SystemStatus />} />
      <Route path="/system/history" element={<SystemStatus />} />
      <Route path="/system/slos" element={<SystemStatus />} />
      <Route path="/system/self-healing" element={<SystemStatus />} />
      <Route path="/system/incidents" element={<SystemStatus />} />
      <Route path="/system/fleet" element={<SystemStatus />} />

      {/* Mission Control */}
      <Route path="/mission-control" element={<MissionControl />} />

      {/* Display Modes */}
      <Route path="/display-modes" element={<CalmFocusMode />} />

      {/* Communication */}
      <Route path="/communication-inbox" element={<CommunicationInbox />} />
      <Route path="/command-history" element={<CommandHistory />} />
      <Route path="/environment-switcher" element={<EnvironmentSwitcherPage />} />
      <Route path="/update-center" element={<UpdateCenterPage />} />
      <Route path="/first-boot" element={<FirstBootSetup />} />

      {/* System Utilities */}
      <Route path="/clipboard-history" element={<ClipboardHistory />} />
      <Route path="/print-scan" element={<PrintScanCenter />} />
      <Route path="/recovery" element={<RecoveryCenter />} />

      {/* Personal Brain */}
      <Route path="/personal-brain" element={<PersonalBrain />} />
      <Route path="/personal-brain/w/:workspaceId" element={<PersonalBrainWorkspace />} />
      <Route path="/personal-brain/c/:chatId" element={<PersonalBrainChat />} />
      <Route path="/personal-brain/snapshot" element={<BrainSnapshot />} />
      <Route path="/personal-brain/command-center" element={<BrainCommandCenter />} />
      <Route path="/personal-brain/voice-settings" element={<PbVoiceSettings />} />
      <Route path="/personal-brain/settings" element={<PbBrainSettings />} />
      <Route path="/personal-brain/settings/security" element={<PbSecuritySettings />} />
      <Route path="/personal-brain/settings/learning" element={<PbLearningSettings />} />
      <Route path="/personal-brain/settings/retention" element={<PbRetentionSettings />} />
      <Route path="/personal-brain/settings/data" element={<PbDataSettings />} />
      <Route path="/personal-brain/settings/profile" element={<PbProfileSettings />} />
      <Route path="/personal-brain/settings/memory" element={<PbMemorySettings />} />
      <Route path="/personal-brain/settings/modes" element={<PbModesSettings />} />
      <Route path="/personal-brain/settings/workspaces" element={<PbWorkspacesSettings />} />
      <Route path="/personal-brain/settings/files" element={<PbFilesSettings />} />
      <Route path="/personal-brain/settings/notifications" element={<PbNotificationsSettings />} />
      <Route path="/personal-brain/settings/labs" element={<PbLabsSettings />} />
      <Route path="/personal-brain/tools" element={<PbToolsRegistry />} />
      <Route path="/personal-brain/invite/:token" element={<PbAcceptInvite />} />

      {/* OS Workspaces */}
      <Route path="/calendar" element={<CalendarWorkspace />} />
      <Route path="/tasks" element={<TasksWorkflowsCenter />} />
      <Route path="/notes" element={<NotesWorkspace />} />
      <Route path="/people" element={<PeopleWorkspace />} />
      <Route path="/team" element={<TeamWorkspace />} />
      <Route path="/editor" element={<DocumentEditor />} />
      <Route path="/reporting" element={<ReportingWorkspace />} />
      <Route path="/media" element={<MediaWorkspace />} />
      <Route path="/templates" element={<TemplateCenter />} />
      <Route path="/import-export" element={<ImportExportCenter />} />
      <Route path="/files/pdf-viewer" element={<PDFViewerWorkspace />} />
      <Route path="/workspace/data-grid" element={<SpreadsheetWorkspace />} />

      {/* Built-in Apps */}
      <Route path="/apps/email" element={<EmailApp />} />
      <Route path="/apps/messenger" element={<MessengerApp />} />
      <Route path="/apps/vault" element={<VaultApp />} />
      <Route path="/apps/health" element={<HealthApp />} />
      <Route path="/apps/gallery" element={<GalleryApp />} />
      <Route path="/apps/weather-news" element={<WeatherNewsApp />} />

      {/* Intelligence Layer */}
      <Route path="/intelligence" element={<IntelligenceDashboard />} />
      <Route path="/intelligence/dashboard" element={<IntelligenceDashboard />} />
      <Route path="/intelligence/device-mesh" element={<DeviceMeshPanel />} />
      <Route path="/intelligence/privacy" element={<PrivacyControlCenter />} />
    </>
  );
}
