import { ConciergePageWrapper } from "@/modules/concierge/components/concierge";
import { SITA_TYPE } from "@/platform/design-system/sita-design-tokens";
import { KPITile, EmptyState } from "@/platform/sita/components/sita/SitaComponents";
import { SectionSkeleton } from "@/platform/sita/components/sita/SectionSkeleton";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { useHouseholds, useHouseholdMembers, useCreateHousehold, useAddHouseholdMember, useDeleteHouseholdMember } from "@/modules/concierge/hooks/use-household";
import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Home, Plus, Trash2, Shield, UserPlus } from "lucide-react";

const HouseholdCommandCenter = () => {
  const { data: households, isLoading } = useHouseholds();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: members } = useHouseholdMembers(selectedId);
  const createHousehold = useCreateHousehold();
  const addMember = useAddHouseholdMember();
  const deleteMember = useDeleteHouseholdMember();

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("family");
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [memberRole, setMemberRole] = useState("member");

  const active = households?.find(h => h.id === selectedId);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createHousehold.mutate({ name: newName, type: newType }, {
      onSuccess: () => { setShowCreate(false); setNewName(""); },
    });
  };

  const handleAddMember = () => {
    if (!memberName.trim() || !selectedId) return;
    addMember.mutate({ household_id: selectedId, display_name: memberName, role: memberRole }, {
      onSuccess: () => { setShowAddMember(false); setMemberName(""); },
    });
  };

  if (isLoading) return <div className="space-y-6"><SectionSkeleton cards={3} columns={3} /></div>;

  if (!households?.length && !showCreate) {
    return (
      <ConciergePageWrapper className="mx-auto max-w-3xl space-y-6">
        <PageTruthBanner />
        <EmptyState icon={Home} title="No households yet" description="Create your first household to start managing family members, roles, and shared tasks." />
        <div className="flex justify-center">
          <button className="micro-press flex items-center gap-1.5 rounded-lg bg-[hsl(265_55%_58%/0.12)] px-3 py-1.5 text-xs text-[hsl(265_55%_58%)] hover:bg-[hsl(265_55%_58%/0.20)] transition-colors" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" /> Create Household
          </button>
        </div>
      </ConciergePageWrapper>
    );
  }

  return (
    <ConciergePageWrapper className="mx-auto max-w-5xl space-y-6">
      <PageTruthBanner />
      <div className="flex items-center justify-end">
        <button className="micro-press flex items-center gap-1.5 rounded-lg bg-[hsl(265_55%_58%)] px-3 py-1.5 text-xs font-medium text-foreground hover:bg-[hsl(265_55%_52%)] transition-colors" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> New Household
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Households" value={households?.length || 0} icon={Home} />
        <KPITile label="Total Members" value={members?.length || 0} icon={Users} />
        <KPITile label="Active Roles" value={new Set(members?.map(m => m.role)).size} icon={Shield} />
        <KPITile label="Shared Items" value={0} icon={Users} />
      </div>

      {showCreate && (
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-5">
          <h4 className="text-[13px] font-semibold text-[hsl(0_0%_85%)]">Create Household</h4>
          <div className="mt-3 space-y-3">
            <input className="w-full rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_7%)] px-4 py-2.5 text-sm text-[hsl(0_0%_85%)]" placeholder="Household name" value={newName} onChange={e => setNewName(e.target.value)} />
            <select className="w-full rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_7%)] px-4 py-2.5 text-sm text-[hsl(0_0%_85%)]" value={newType} onChange={e => setNewType(e.target.value)}>
              <option value="family">Family</option>
              <option value="business">Business</option>
              <option value="mixed">Mixed</option>
            </select>
            <div className="flex gap-2">
              <button className="micro-press rounded-lg bg-[hsl(152_55%_48%/0.12)] px-3 py-1.5 text-xs text-[hsl(152_55%_48%)] hover:bg-[hsl(152_55%_48%/0.20)] transition-colors" onClick={handleCreate}>Create</button>
              <button className="micro-press rounded-lg bg-[hsl(0_0%_100%/0.06)] px-3 py-1.5 text-xs text-[hsl(0_0%_60%)] hover:bg-[hsl(0_0%_100%/0.10)] transition-colors" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-2">
          {households?.map(h => (
            <button
              key={h.id}
              onClick={() => setSelectedId(h.id)}
              className={`micro-hover-lift w-full text-left rounded-xl border p-4 transition-all ${selectedId === h.id ? "border-[hsl(265_55%_58%/0.4)] bg-[hsl(0_0%_12%)]" : "border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)]"}`}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[hsl(265_55%_58%/0.12)] p-2"><Home className="h-4 w-4 text-[hsl(265_55%_58%)]" /></div>
                <div>
                  <p className="text-sm font-medium text-[hsl(0_0%_85%)]">{h.name}</p>
                  <p className="text-xs text-[hsl(0_0%_50%)] capitalize">{h.type}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 space-y-4">
          {active ? (
            <>
              <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_12%)] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-[13px] font-semibold text-[hsl(0_0%_85%)]">{active.name}</h4>
                    <p className="text-xs text-[hsl(0_0%_50%)]">Type: {active.type}</p>
                  </div>
                  <button className="micro-press flex items-center gap-1.5 rounded-lg bg-[hsl(265_55%_58%/0.12)] px-3 py-1.5 text-xs text-[hsl(265_55%_58%)] hover:bg-[hsl(265_55%_58%/0.20)] transition-colors" onClick={() => setShowAddMember(true)}>
                    <UserPlus className="h-3.5 w-3.5" /> Add Member
                  </button>
                </div>
              </div>

              {showAddMember && (
                <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4">
                  <div className="space-y-3">
                    <input className="w-full rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_7%)] px-4 py-2.5 text-sm text-[hsl(0_0%_85%)]" placeholder="Member name" value={memberName} onChange={e => setMemberName(e.target.value)} />
                    <select className="w-full rounded-lg border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_7%)] px-4 py-2.5 text-sm text-[hsl(0_0%_85%)]" value={memberRole} onChange={e => setMemberRole(e.target.value)}>
                      <option value="member">Member</option>
                      <option value="parent">Parent</option>
                      <option value="child">Child</option>
                      <option value="guardian">Guardian</option>
                      <option value="caregiver">Caregiver</option>
                    </select>
                    <div className="flex gap-2">
                      <button className="micro-press rounded-lg bg-[hsl(152_55%_48%/0.12)] px-3 py-1.5 text-xs text-[hsl(152_55%_48%)]" onClick={handleAddMember}>Add</button>
                      <button className="micro-press rounded-lg bg-[hsl(0_0%_100%/0.06)] px-3 py-1.5 text-xs text-[hsl(0_0%_60%)]" onClick={() => setShowAddMember(false)}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {members?.map(m => (
                  <div key={m.id} className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(265_55%_58%/0.12)] text-[hsl(265_55%_58%)] text-xs font-bold">{m.display_name.charAt(0)}</div>
                        <div>
                          <p className="text-sm font-medium text-[hsl(0_0%_85%)]">{m.display_name}</p>
                          <p className="text-xs text-[hsl(0_0%_50%)] capitalize">{m.role}</p>
                        </div>
                      </div>
                      <button onClick={() => deleteMember.mutate(m.id)} className="rounded-md p-1.5 text-[hsl(0_0%_50%)] hover:text-[hsl(0_70%_55%)] hover:bg-[hsl(0_70%_55%/0.10)] transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {(!members || members.length === 0) && (
                  <EmptyState icon={Users} title="No members yet" description="Add family members to this household" />
                )}
              </div>
            </>
          ) : (
            <EmptyState icon={Users} title="Select a household" description="Click a household to manage its members" />
          )}
        </div>
      </div>
    </ConciergePageWrapper>
  );
};

export default HouseholdCommandCenter;
