import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { dateExtractFromMySQLDateTime } from "../../../../lib/useDate";
import { CirclePlus, Search } from "lucide-react";
import { addNewProblem, addProblemToCollection } from "../../../../lib/problem";
import Problems from "./Problems";
import ProblemMenu from "./ProblemMenu";

export default function Collection() {
    const { collectionID } = useParams();
    const [collection, setCollection] = useState({});
    const [problemss, setProblems] = useState([]);
    const [newProblem, setNewProblem] = useState({
        subject: "",
        topics: "",
        description: "",
        renderedDescription: "",
        solution: "",
        renderedSolution: ""
    });

    
    const getProblemsByCollection = async (collectionID) => {
        try {
            const APIRoot = process.env.REACT_APP_API_ROOT;
            const getProblemsByCollectionAPI = process.env.REACT_APP_GET_PROBLEMS_BY_COLLECTIONS;
            console.log(APIRoot + getProblemsByCollectionAPI + `?collectionID=${collectionID}`);
            const response = await fetch(APIRoot + getProblemsByCollectionAPI + `?collectionID=${collectionID}`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-type": "application/json"
                }
            });
            if (!response.ok) {
                throw Error("Could not get problems by collection");
            }
            const resp = await response.json();
            const probs = resp.problems;
            setProblems(probs);
        } catch (err) {
            console.error("Could not get problems by collection:", err);
        }
    };

    const problemInput = () => {
        const subject = document.getElementById("subject").value;
        const topics = document.getElementById("topics").value;
        const description = document.getElementById("description").value;
        const renderedDescription = description;
        const solution = document.getElementById("solution").value;
        const renderedSolution = solution;
        setNewProblem({
            subject,
            topics,
            description,
            renderedDescription,
            solution,
            renderedSolution
        });
    }

    const addProblem = async() => {
        const problemID = await addNewProblem(newProblem);
        setNewProblem({
            subject: "",
            topics: "",
            description: "",
            renderedDescription: "",
            solution: "",
            renderedSolution: ""
        });

        await addProblemToCollection(collectionID, problemID);
        await getProblemsByCollection(collectionID);
        document.getElementById("newProblem").close();
    };

    useEffect(() => {
        const getCollection = async (collectionID) => {
            try {
                const APIRoot = process.env.REACT_APP_API_ROOT;
                const getCollectionByIDAPI = process.env.REACT_APP_GET_COLLECTION_BY_ID;
                const response = await fetch(APIRoot + getCollectionByIDAPI + `?collectionID=${collectionID}`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-type": "application/json"
                    }
                });
                if (!response.ok) {
                    throw Error("Could not get collection by id");
                }
                const resp = await response.json();
                let col = resp.collection;
                col.dateCreated = dateExtractFromMySQLDateTime(col.dateCreated);
                col.lastUpdate = dateExtractFromMySQLDateTime(col.lastUpdate);
                setCollection(col);
            } catch (err) {
                console.error("Could not get collection by id");
            }
        };
        getCollection(collectionID);
        getProblemsByCollection(collectionID);
    }, [collectionID]);

    return (
        <div className="flex flex-col w-full h-full gap-2">
            {/* Header */}
            <div className="flex justify-between border-b-2">
                <h1 className="flex text-xl gap-1"> <p className="hidden md:block">Collections | </p> <p className="text-accent"> {collection.collectionName}</p></h1>
                <div className="md:flex gap-3 hidden">
                    <p className="text-xs"><span className="text-error">Last Modified:</span> {collection.lastUpdate}</p>
                    <p className="text-xs"><span className="text-primary">Date Created:</span> {collection.dateCreated}</p>
                </div>
            </div>
            <div className="flex flex-col-reverse md:flex-row justify-between items-center">
                <button className="btn btn-neutral btn-ghost btn-sm" onClick={() => { document.getElementById('newProblem').showModal(); }}>
                    <span className="flex items-center gap-1"><CirclePlus className="w-4 h-4" /> Add New Problem</span>
                </button>
                {/* Open the modal using document.getElementById('ID').showModal() method */}
                <dialog id="newProblem" className="modal">
                    <div className="flex flex-col md:flex-row modal-box md:w-11/12 max-w-5xl h-full md:h-2/3 gap-5">
                        <div className="flex flex-col w-full md:w-1/2 h-full p-4 overflow-y-scroll gap-5">
                            <h1 className="text-secondary">Create a New Problem</h1>
                            <div className="flex flex-col w-full h-full overflow-y-scroll bg-neutral rounded-lg p-2 gap-2">
                                <div className="flex flex-col md:flex-row gap-2 w-full">
                                    <input type="text" id="subject" placeholder="Subject" value={newProblem.subject} className="input w-full md:w-1/3 rounded-lg text-sm" onChange={problemInput}/>
                                    <input type="text" id="topics" placeholder="Topics" value={newProblem.topics} className="input w-full md:w-2/3 rounded-lg text-sm" onChange={problemInput}/>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <textarea id="description" value={newProblem.description} placeholder="Problem Description..." cols="30" rows="5" className="textarea" onChange={problemInput}></textarea>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <textarea id="solution" value={newProblem.solution} placeholder="Solution Description..." cols="30" rows="5" className="textarea" onChange={problemInput}></textarea>
                                </div>
                                <div className="flex w-1/2 gap-2">
                                    <button className="btn btn-secondary" onClick={addProblem}>Add Problem</button>
                                    <button className="btn btn-accent" onClick={() => document.getElementById("newProblem").close()}>Cancel</button>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col w-full md:w-1/2 h-full p-4 bg-neutral overflow-y-scroll gap-5">
                            <h1 className="text-accent">Preview</h1>
                            <div className="flex flex-col w-full h-full rounded-lg p-2 gap-5">
                                <div className="flex flex-col gap-2 w-full">
                                    <h1 className="text-sm">Subject: {newProblem.subject}</h1>
                                    <h2 className="text-sm">Topics: {newProblem.topics}</h2>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="descprev" className="text-sm">Description:</label>
                                    <textarea id="descprev" value={newProblem.renderedDescription} cols="30" rows="7" className="rounded-lg p-2 text-sm" disabled style={{cursor: "default"}}></textarea>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="solprev" className="text-sm">Solution:</label>
                                    <textarea id="solprev" value={newProblem.renderedSolution} cols="30" rows="7" className="rounded-lg p-2 text-sm" disabled style={{cursor: "default"}}></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </dialog>

                <label className="hidden input input-bordered md:w-1/2 md:flex items-center gap-2">
                    <input type="text" className="grow" placeholder="Search Problems..." />
                    <Search />
                </label>
            </div>
            <div className="flex w-full h-screen gap-5">
                <Problems problemss={problemss}/>
                <ProblemMenu />
            </div>
        </div>
    )
}