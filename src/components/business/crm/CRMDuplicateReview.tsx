import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCRMContacts, useUpdateContact, useDeleteContact } from "@/hooks/use-crm-data";
import { Merge, ArrowRight, CheckCircle, AlertTriangle, User, Mail, Phone, Building, Search, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DuplicateGroup {
  key: string;
  contacts: any[];
  matchReason: string;
}

const CRMDuplicateReview = () => {
  const { data: contacts = [] } = useCRMContacts();
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();
  const [mergedIds, setMergedIds] = useState<Set<string>>(new Set());
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [winnerMap, setWinnerMap] = useState<Record<string, Record<string, string>>>({});

  const duplicateGroups = useMemo(() => {
    const groups: DuplicateGroup[] = [];
    const emailMap = new Map<string, any[]>();
    const nameMap = new Map<string, any[]>();

    contacts.forEach(c => {
      if (mergedIds.has(c.id)) return;
      if (c.email) {
        const key = c.email.toLowerCase();
        if (!emailMap.has(key)) emailMap.set(key, []);
        emailMap.get(key)!.push(c);
      }
      const nameKey = `${c.first_name?.toLowerCase()?.trim()}_${c.last_name?.toLowerCase()?.trim()}`;
      if (nameKey && nameKey !== "_") {
        if (!nameMap.has(nameKey)) nameMap.set(nameKey, []);
        nameMap.get(nameKey)!.push(c);
      }
    });

    emailMap.forEach((group, email) => {
      if (group.length >= 2) groups.push({ key: `email:${email}`, contacts: group, matchReason: `Same email: ${email}` });
    });

    nameMap.forEach((group, name) => {
      if (group.length >= 2) {
        const ids = new Set(group.map(c => c.id));
        const alreadyCoveredByEmail = groups.some(g => g.contacts.every(c => ids.has(c.id)));
        if (!alreadyCoveredByEmail) {
          groups.push({ key: `name:${name}`, contacts: group, matchReason: `Same name: ${name.replace("_", " ")}` });
        }
      }
    });

    return groups;
  }, [contacts, mergedIds]);

  const handleMerge = async (group: DuplicateGroup) => {
    const winners = winnerMap[group.key] || {};
    const primary = group.contacts[0]; // default winner is first
    const loserIds = group.contacts.slice(1).map(c => c.id);

    // Build merged record from field-level winners
    const mergedFields: Record<string, any> = {};
    const fields = ["first_name", "last_name", "email", "phone", "title", "source", "lifecycle_stage", "tags", "city", "country"];
    fields.forEach(field => {
      const winnerId = winners[field] || primary.id;
      const winner = group.contacts.find(c => c.id === winnerId) || primary;
      if (winner[field]) mergedFields[field] = winner[field];
    });

    try {
      // Update winner with merged fields
      await updateContact.mutateAsync({ id: primary.id, updates: mergedFields });

      // Reassign communications, notes, tasks to winner
      for (const loserId of loserIds) {
        await (supabase as any).from("crm_communications").update({ contact_id: primary.id }).eq("contact_id", loserId);
        await (supabase as any).from("crm_notes").update({ contact_id: primary.id }).eq("contact_id", loserId);
        await (supabase as any).from("crm_tasks").update({ contact_id: primary.id }).eq("contact_id", loserId);

        // Log merge
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await (supabase as any).from("crm_merge_log").insert({
            user_id: user.id,
            entity_type: "contact",
            winner_id: primary.id,
            loser_id: loserId,
            merged_fields: mergedFields,
            merge_reason: group.matchReason,
          });
        }

        // Delete loser
        await deleteContact.mutateAsync(loserId);
      }

      setMergedIds(prev => new Set([...prev, ...loserIds]));
      toast.success(`Merged ${group.contacts.length} contacts into one`);
    } catch {
      toast.error("Merge failed");
    }
  };

  const activeGroup = duplicateGroups.find(g => g.key === selectedGroup);

  if (duplicateGroups.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 gap-3">
        <Shield className="h-12 w-12 text-[hsl(var(--trust-safe))]/60" />
        <p className="text-sm font-semibold text-foreground">No Duplicates Detected</p>
        <p className="text-xs text-muted-foreground">Your contact database appears clean</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Merge className="h-4 w-4 text-yellow-500" />
            {duplicateGroups.length} Duplicate Group{duplicateGroups.length !== 1 && "s"} Found
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Review and merge duplicates to keep your CRM clean</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Group list */}
        <div className="space-y-2">
          {duplicateGroups.map(group => (
            <Card
              key={group.key}
              className={`border-border/50 bg-card/50 backdrop-blur-sm cursor-pointer transition-all hover:border-primary/30 ${
                selectedGroup === group.key ? "border-primary ring-1 ring-primary/20" : ""
              }`}
              onClick={() => setSelectedGroup(group.key)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-foreground">{group.contacts.length} contacts</p>
                    <p className="text-[10px] text-muted-foreground">{group.matchReason}</p>
                  </div>
                  <div className="flex -space-x-2">
                    {group.contacts.slice(0, 3).map(c => (
                      <div key={c.id} className="w-7 h-7 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-[10px] font-bold text-primary">
                        {c.first_name?.[0]}{c.last_name?.[0]}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Merge detail */}
        {activeGroup ? (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground">Side-by-Side Comparison</p>
                <Button size="sm" variant="default" className="gap-1.5 text-xs h-7" onClick={() => handleMerge(activeGroup)}>
                  <Merge className="h-3 w-3" /> Merge
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-1.5 text-left text-muted-foreground font-medium">Field</th>
                      {activeGroup.contacts.map((c, i) => (
                        <th key={c.id} className="py-1.5 text-left font-medium text-foreground">
                          {i === 0 ? "Winner" : `Record ${i + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {["first_name", "last_name", "email", "phone", "title", "lifecycle_stage", "source", "city"].map(field => {
                      const groupWinners = winnerMap[activeGroup.key] || {};
                      const winnerId = groupWinners[field] || activeGroup.contacts[0].id;
                      return (
                        <tr key={field} className="border-b border-border/50">
                          <td className="py-1.5 text-muted-foreground capitalize">{field.replace("_", " ")}</td>
                          {activeGroup.contacts.map(c => (
                            <td
                              key={c.id}
                              onClick={() => setWinnerMap(prev => ({
                                ...prev,
                                [activeGroup.key]: { ...(prev[activeGroup.key] || {}), [field]: c.id },
                              }))}
                              className={`py-1.5 cursor-pointer rounded px-1 transition-all ${
                                winnerId === c.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/30"
                              }`}
                            >
                              {c[field] || "—"}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-muted-foreground">Click on a cell to select it as the winning value for that field</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-center justify-center text-xs text-muted-foreground">
            Select a duplicate group to compare
          </div>
        )}
      </div>
    </div>
  );
};

export default CRMDuplicateReview;
