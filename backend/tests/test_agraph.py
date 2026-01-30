import streamlit as st
from streamlit_agraph import agraph, Node, Edge, Config

st.title("Agraph Test")

nodes = [
    Node(id="Espresso", label="Espresso", size=25, shape="circularImage", image="https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg"),
    Node(id="FlatWhite", label="FlatWhite", size=25, shape="circularImage", image="https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg"),
]

edges = [
    Edge(source="Espresso", target="FlatWhite", label="is_part_of"),
]

config = Config(width=500, 
                height=500, 
                directed=True,
                nodeHighlightBehavior=True, 
                highlightColor="#F7A7A6", 
                collapsible=True,
                node={'labelProperty': 'label'},
                link={'labelProperty': 'label', 'renderLabel': True}
                )

return_value = agraph(nodes=nodes, 
                      edges=edges, 
                      config=config)
