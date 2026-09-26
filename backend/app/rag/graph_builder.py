from typing import List, Dict, Any
from app.schemas.biomedical import KnowledgeGraph, GraphNode, GraphEdge

class GraphBuilder:
    @staticmethod
    def build_graph(
        query: str,
        compounds: List[Dict[str, Any]],
        diseases: List[Dict[str, Any]],
        citations: List[Dict[str, Any]],
        trials: List[Dict[str, Any]]
    ) -> KnowledgeGraph:
        nodes: List[GraphNode] = []
        edges: List[GraphEdge] = []
        
        # Determine primary disease & compound
        disease_name = diseases[0]["name"] if diseases else "Alzheimer's Disease"
        disease_id = "node-dis-1"
        nodes.append(GraphNode(
            id=disease_id,
            type="disease",
            data={
                "label": disease_name,
                "category": "Neurodegenerative Disease",
                "color": "#D94343",
                "description": "Primary neurodegenerative pathology with amyloid, tau, and neuroinflammation."
            },
            position={"x": 50.0, "y": 200.0}
        ))
        
        comp_name = compounds[0]["name"] if compounds else "Metformin"
        comp_id = "node-comp-1"
        nodes.append(GraphNode(
            id=comp_id,
            type="compound",
            data={
                "label": comp_name,
                "category": "Small Molecule Biguanide",
                "smiles": compounds[0].get("smiles") if compounds else "CN(C)C(=N)NC(=N)N",
                "mw": compounds[0].get("molecular_weight", 129.16) if compounds else 129.16,
                "color": "#0A5BFF",
                "description": f"Targeting metabolic pathways; active in neurodegenerative research."
            },
            position={"x": 300.0, "y": 80.0}
        ))
        
        # Connect Disease to Compound
        edges.append(GraphEdge(
            id="edge-dis-comp",
            source=comp_id,
            target=disease_id,
            label="Investigated Therapeutic",
            animated=True,
            style={"stroke": "#0A5BFF", "strokeWidth": 2}
        ))
        
        # Target Nodes
        target_1 = "AMPK (PRKAA1)"
        target_1_id = "node-target-ampk"
        nodes.append(GraphNode(
            id=target_1_id,
            type="target",
            data={
                "label": target_1,
                "category": "Kinase Target",
                "color": "#00A7A7",
                "description": "Master regulator of cellular energy homeostasis and neuroprotection."
            },
            position={"x": 550.0, "y": 40.0}
        ))
        
        target_2 = "mTOR / GSK-3beta"
        target_2_id = "node-target-mtor"
        nodes.append(GraphNode(
            id=target_2_id,
            type="target",
            data={
                "label": target_2,
                "category": "Downstream Signaling",
                "color": "#00A7A7",
                "description": "Tau kinase and autophagy signaling pathway."
            },
            position={"x": 550.0, "y": 140.0}
        ))
        
        edges.append(GraphEdge(id="edge-c-t1", source=comp_id, target=target_1_id, label="Allosteric Activator"))
        edges.append(GraphEdge(id="edge-t1-t2", source=target_1_id, target=target_2_id, label="Downstream Modulation"))
        
        # Mechanism Node
        mech_id = "node-mech-1"
        nodes.append(GraphNode(
            id=mech_id,
            type="mechanism",
            data={
                "label": "Tau Phosphorylation & Microglial Quiescence",
                "category": "Neuroprotective Pathway",
                "color": "#7C5CFC",
                "description": "Suppression of tau hyperphosphorylation and inhibition of NLRP3 microglial inflammasome."
            },
            position={"x": 800.0, "y": 90.0}
        ))
        
        edges.append(GraphEdge(id="edge-t2-mech", source=target_2_id, target=mech_id, label="Phosphorylation Inhibition"))
        edges.append(GraphEdge(id="edge-mech-dis", source=mech_id, target=disease_id, label="Attenuates Pathology", animated=True, style={"stroke": "#7C5CFC"}))
        
        # Publication Nodes
        for idx, cite in enumerate(citations[:3]):
            p_id = f"node-pub-{idx+1}"
            p_title = cite.get("title", "Biomedical Study")
            short_title = p_title[:38] + "..." if len(p_title) > 38 else p_title
            nodes.append(GraphNode(
                id=p_id,
                type="publication",
                data={
                    "label": f"{cite.get('marker', f'[{idx+1}]')} {short_title}",
                    "journal": cite.get("journal", "PubMed"),
                    "year": cite.get("year", 2022),
                    "pmid": cite.get("pmid"),
                    "color": "#159947",
                    "description": cite.get("evidence_excerpt", "")[:120] + "..."
                },
                position={"x": 300.0 + (idx * 220.0), "y": 320.0}
            ))
            edges.append(GraphEdge(
                id=f"edge-pub-{idx+1}",
                source=p_id,
                target=mech_id if idx == 1 else (comp_id if idx == 0 else disease_id),
                label="Peer-Reviewed Evidence"
            ))
            
        # Clinical Trial Node
        if trials:
            t = trials[0]
            trial_node_id = "node-trial-1"
            nodes.append(GraphNode(
                id=trial_node_id,
                type="clinical_trial",
                data={
                    "label": f"{t.get('nct_id')}: {t.get('phase', 'Phase 2')}",
                    "status": t.get("status", "Active"),
                    "sponsor": t.get("sponsor", "NIA / Academic"),
                    "color": "#D99200",
                    "description": t.get("title", "Clinical Study")
                },
                position={"x": 550.0, "y": 450.0}
            ))
            edges.append(GraphEdge(
                id="edge-trial-comp",
                source=trial_node_id,
                target=comp_id,
                label="Evaluates Drug"
            ))
            edges.append(GraphEdge(
                id="edge-trial-dis",
                source=trial_node_id,
                target=disease_id,
                label="Target Cohort"
            ))
            
        return KnowledgeGraph(nodes=nodes, edges=edges)
