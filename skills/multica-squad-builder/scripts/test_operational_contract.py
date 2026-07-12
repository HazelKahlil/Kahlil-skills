#!/usr/bin/env python3
"""Behavior-level checks for the generated squad operating contract."""

from pathlib import Path
import importlib.util
import unittest


ROOT = Path(__file__).resolve().parents[1]


def read(relative_path: str) -> str:
    path = ROOT / relative_path
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8")


class OperationalContractTests(unittest.TestCase):
    def assert_terms(self, relative_path: str, *terms: str) -> None:
        text = read(relative_path).lower()
        self.assertTrue(text, f"missing or empty file: {relative_path}")
        for term in terms:
            self.assertIn(term.lower(), text, f"{relative_path} misses: {term}")

    def test_topology_is_chosen_before_roster_size(self) -> None:
        self.assert_terms(
            "SKILL.md",
            "execution topology",
            "direct single agent",
            "routed single-worker",
            "staged or parallel squad",
        )
        self.assert_terms(
            "templates/setup-pack-template.md",
            "execution topology decision",
            "why a squad is needed",
        )

    def test_dispatch_has_receipt_and_idempotency(self) -> None:
        self.assert_terms(
            "references/operational-reliability.md",
            "dispatch receipt",
            "queued / dispatched / running",
            "idempotency key",
            "do not claim that dispatch succeeded",
        )

    def test_failure_recovery_is_bounded(self) -> None:
        self.assert_terms(
            "references/operational-reliability.md",
            "agent_error",
            "one recovery attempt",
            "same failure class",
            "blocked",
        )

    def test_owner_experience_and_permission_bundle_are_explicit(self) -> None:
        self.assert_terms(
            "references/operational-reliability.md",
            "owner experience contract",
            "result first",
            "do not ask the same question twice",
            "source artifact",
            "pr_create",
            "push the task branch",
        )

    def test_context_fleet_and_evolution_have_stop_conditions(self) -> None:
        self.assert_terms(
            "references/operational-reliability.md",
            "context budget",
            "80 comments",
            "successor issue",
            "fleet lifecycle",
            "at least three substantive completed tasks",
            "zero-sample",
            "optional overlay",
        )

    def test_runtime_templates_carry_the_contract(self) -> None:
        self.assert_terms(
            "templates/agent-captain-system-instructions.md",
            "dispatch receipt",
            "one recovery attempt",
            "idempotency",
        )
        self.assert_terms(
            "templates/agent-worker-system-instructions.md",
            "member delivery contract",
            "pr_create",
            "source artifact",
        )
        self.assert_terms(
            "templates/squad-instructions.md",
            "owner experience contract",
            "context budget",
            "evolution evidence threshold",
        )

    def test_minimal_pack_renders_without_hidden_placeholders(self) -> None:
        renderer_path = ROOT / "scripts/render_minimal_pack.py"
        spec = importlib.util.spec_from_file_location("render_minimal_pack", renderer_path)
        self.assertIsNotNone(spec)
        self.assertIsNotNone(spec.loader)
        renderer = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(renderer)

        data = {
            "project_name": "Example Project",
            "squad_name": "Example Squad",
            "project_archetype": "existing_project",
            "execution_topology": "routed_single_worker",
            "squad_justification": "The issue is already squad-assigned and needs one routed Worker.",
            "human_owner": "Example Owner",
            "issue_prefix": "EXAMPLE",
            "enabled_roles": ["captain", "worker"],
            "agents": {
                "captain": "Captain",
                "worker": "Worker",
                "reviewer": None,
                "analyst": None,
            },
            "mention_markdown": {
                "captain": "Captain mention",
                "worker": "Worker mention",
                "reviewer": None,
                "analyst": None,
                "human_owner": "Owner mention",
            },
            "context_budget": {"comment_limit": 80},
            "evolution": {"substantive_completed_task_threshold": 3},
        }
        templates = renderer.template_paths(data)
        self.assertNotIn("templates/agent-reviewer-system-instructions.md", templates)
        self.assertNotIn("templates/agent-analyst-system-instructions.md", templates)
        rendered = "\n\n---\n\n".join(
            renderer.fill(renderer.load(relative_path), data)
            for relative_path in templates
        )
        self.assertEqual([], renderer.unresolved_required(rendered))
        self.assertNotIn("{{", rendered)
        self.assertIn("Not installed", rendered)
        self.assertIn("routed_single_worker", rendered)
        self.assertIn("PR_CREATE", rendered)


if __name__ == "__main__":
    unittest.main(verbosity=2)
