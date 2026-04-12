import { SitaPageHeader, SitaCard, SitaCardTitle, SitaButton } from "@/components/sita/SitaCard";
import { ConciergePageWrapper } from "@/components/concierge";
import { KPITile, EmptyState } from "@/components/sita/SitaComponents";
import { SectionSkeleton } from "@/components/sita/SectionSkeleton";
import { useHouseholds, useHouseholdMembers, useCreateHousehold, useAddHouseholdMember, useDeleteHouseholdMember } from "@/hooks/use-household";
import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Home, Plus, Trash2, Shield, UserPlus } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

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
      <DemoModeBadge />
        <SitaPageHeader title="Household Support Coordination" subtitle="Manage your household members, roles, and shared responsibilities" />
        <EmptyState icon={Home} title="No households yet" description="Create your first household to start managing family members, roles, and shared tasks." />
        <div className="flex justify-center">
          <SitaButton variant="primary" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" /> Create Household</SitaButton>
        </div>
      </ConciergePageWrapper>
    );
  }

  return (
    <motion.div className="mx-auto max-w-5xl space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <SitaPageHeader
        title="Household Command Center"
        subtitle="Members, roles, and shared responsibilities"
        actions={<SitaButton variant="primary" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" /> New Household</SitaButton>}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Households" value={households?.length || 0} icon={Home} />
        <KPITile label="Total Members" value={members?.length || 0} icon={Users} />
        <KPITile label="Active Roles" value={new Set(members?.map(m => m.role)).size} icon={Shield} />
        <KPITile label="Shared Items" value={0} icon={Users} />
      </div>

      {showCreate && (
        <SitaCard hover={false} glow className="p-5">
          <SitaCardTitle>Create Household</SitaCardTitle>
          <div className="mt-3 space-y-3">
            <input className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground" placeholder="Household name" value={newName} onChange={e => setNewName(e.target.value)} />
            <select className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground" value={newType} onChange={e => setNewType(e.target.value)}>
              <option value="family">Family</option>
              <option value="business">Business</option>
              <option value="mixed">Mixed</option>
            </select>
            <div className="flex gap-2">
              <SitaButton variant="primary" onClick={handleCreate}>Create</SitaButton>
              <SitaButton variant="secondary" onClick={() => setShowCreate(false)}>Cancel</SitaButton>
            </div>
          </div>
        </SitaCard>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-2">
          {households?.map(h => (
            <SitaCard key={h.id} selected={selectedId === h.id} onClick={() => setSelectedId(h.id)} className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2"><Home className="h-4 w-4 text-primary" /></div>
                <div>
                  <p className="text-sm font-medium text-foreground">{h.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{h.type}</p>
                </div>
              </div>
            </SitaCard>
          ))}
        </div>

        <div className="lg:col-span-3 space-y-4">
          {active ? (
            <>
              <SitaCard hover={false} glow className="p-5">
                <div className="flex items-center justify-between">
                  <SitaCardTitle sub={`Type: ${active.type}`}>{active.name}</SitaCardTitle>
                  <SitaButton variant="secondary" size="sm" onClick={() => setShowAddMember(true)}><UserPlus className="h-3.5 w-3.5" /> Add Member</SitaButton>
                </div>
              </SitaCard>

              {showAddMember && (
                <SitaCard hover={false} className="p-4">
                  <div className="space-y-3">
                    <input className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground" placeholder="Member name" value={memberName} onChange={e => setMemberName(e.target.value)} />
                    <select className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground" value={memberRole} onChange={e => setMemberRole(e.target.value)}>
                      <option value="member">Member</option>
                      <option value="parent">Parent</option>
                      <option value="child">Child</option>
                      <option value="guardian">Guardian</option>
                      <option value="caregiver">Caregiver</option>
                    </select>
                    <div className="flex gap-2">
                      <SitaButton variant="primary" onClick={handleAddMember}>Add</SitaButton>
                      <SitaButton variant="secondary" onClick={() => setShowAddMember(false)}>Cancel</SitaButton>
                    </div>
                  </div>
                </SitaCard>
              )}

              <div className="space-y-2">
                {members?.map(m => (
                  <SitaCard key={m.id} hover={false} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent text-xs font-bold">{m.display_name.charAt(0)}</div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{m.display_name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{m.role}</p>
                        </div>
                      </div>
                      <button onClick={() => deleteMember.mutate(m.id)} className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </SitaCard>
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
    </motion.div>
  );
};

export default HouseholdCommandCenter;
