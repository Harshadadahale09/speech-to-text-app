import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import jsPDF from "jspdf";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaMicrophone } from "react-icons/fa";
import { ClipLoader } from "react-spinners";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const [search, setSearch] = useState("");
  const [totalUploads, setTotalUploads] = useState(0);
  const [totalRecordings, setTotalRecordings] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/transcriptions/history`
      );

      setHistory(res.data);

      setTotalUploads(
        res.data.filter(
          (item) =>
            !item.originalName.includes(
              "recording.webm"
            )
        ).length
      );

      setTotalRecordings(
        res.data.filter(
          (item) =>
            item.originalName.includes(
              "recording.webm"
            )
        ).length
      );
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const startRecording = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      const mediaRecorder =
        new MediaRecorder(stream);

      mediaRecorderRef.current =
        mediaRecorder;

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (
        event
      ) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(
          chunksRef.current,
          {
            type: "audio/webm",
          }
        );

        const recordedFile = new File(
          [audioBlob],
          "recording.webm",
          {
            type: "audio/webm",
          }
        );

        setFile(recordedFile);

        alert(
          "Recording completed. Click Upload Audio."
        );
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.log(error);
      alert(
        "Microphone permission denied"
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const uploadAudio = async () => {
    if (!file) {
      alert(
        "Please select or record audio"
      );
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("audio", file);

      const res = await axios.post(
        `${API_URL}/transcriptions/upload`,
        formData
      );

      setTranscript(res.data.text);

      await fetchHistory();

      setFile(null);
    } catch (err) {
      console.log(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteTranscript = async (id) => {
    try {
      await axios.delete(
        `${API_URL}/transcriptions/${id}`
      );

      fetchHistory();
    } catch (err) {
      console.log(err);
    }
  };

  
   const downloadTranscript = (
  text,
  fileName
) => {
  const element =
    document.createElement("a");

  const file = new Blob(
    [text],
    {
      type: "text/plain",
    }
  );

  element.href =
    URL.createObjectURL(file);

  element.download =
    `${fileName}.txt`;

  document.body.appendChild(
    element
  );

  element.click();

  document.body.removeChild(
    element
  );
};

const downloadPDF = (
  text,
  fileName
) => {
  const doc = new jsPDF();

  doc.setFontSize(16);

  doc.text(
    "Speech To Text Transcript",
    20,
    20
  );

  doc.setFontSize(12);

  const lines =
    doc.splitTextToSize(
      text || "No transcript",
      170
    );

  doc.text(
    lines,
    20,
    40
  );

  doc.save(
    `${fileName}.pdf`
  );
};
const chartData = [
  {
    name: "Uploads",
    count: totalUploads,
  },
  {
    name: "Recordings",
    count: totalRecordings,
  },
  {
    name: "Total",
    count: history.length,
  },
];
  return (
    <div
      className={`min-h-screen p-8 ${
        darkMode
          ? "bg-slate-900"
          : "bg-slate-100"
      }`}
    >
      <div
        className={`mx-auto max-w-4xl rounded-2xl p-8 shadow-lg ${
          darkMode
            ? "bg-slate-800 text-white"
            : "bg-white text-black"
        }`}
      >
        <h1 className="mb-8 text-center text-5xl font-extrabold text-blue-600">
          🎤 Speech To Text Converter
        </h1>

        <div className="mb-6 text-right">
          <button
            onClick={() =>
              setDarkMode(!darkMode)
            }
            className="rounded-lg bg-black px-4 py-2 text-white"
          >
            {darkMode
              ? "☀️ Light Mode"
              : "🌙 Dark Mode"}
          </button>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-blue-100 p-5 text-center shadow">
            <h2 className="text-lg font-bold text-blue-700">
              Total Transcripts
            </h2>
            <p className="text-3xl font-bold">
              {history.length}
            </p>
          </div>

          <div className="rounded-xl bg-green-100 p-5 text-center shadow">
            <h2 className="text-lg font-bold text-green-700">
              Total Uploads
            </h2>
            <p className="text-3xl font-bold">
              {totalUploads}
            </p>
          </div>

          <div className="rounded-xl bg-purple-100 p-5 text-center shadow">
            <h2 className="text-lg font-bold text-purple-700">
              Total Recordings
            </h2>
            <p className="text-3xl font-bold">
              {totalRecordings}
            </p>
          </div>
        </div>
        <div className="mb-8 rounded-xl bg-white p-5 shadow">
  <h2 className="mb-4 text-center text-2xl font-bold">
    Analytics Dashboard
  </h2>

  <ResponsiveContainer
    width="100%"
    height={300}
  >
    <BarChart data={chartData}>
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar
        dataKey="count"
        fill="#3b82f6"
      />
    </BarChart>
  </ResponsiveContainer>
</div>

        <input
          type="file"
          accept="audio/*"
          onChange={(e) =>
            setFile(e.target.files[0])
          }
          className="mb-4 w-full"
        />

        {file && (
          <div className="mb-4 rounded-lg bg-gray-100 p-2 text-sm text-gray-700">
            📄 Selected File: {file.name}
          </div>
        )}

        <div className="mb-4 flex gap-3">
          {!recording ? (
            <button
              onClick={startRecording}
              className="rounded-lg bg-green-600 px-5 py-3 text-white hover:bg-green-700"
            >
              <FaMicrophone className="mr-2 inline" />
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="rounded-lg bg-red-600 px-5 py-3 text-white hover:bg-red-700"
            >
              ⏹ Stop Recording
            </button>
          )}

          <button
            onClick={uploadAudio}
            className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
          >
            {loading ? (
              <ClipLoader
                color="#ffffff"
                size={20}
              />
            ) : (
              "Upload Audio"
            )}
          </button>
        </div>

        {transcript && (
          <div className="mt-6 rounded-xl bg-blue-50 p-5 shadow">
            <h2 className="mb-2 text-xl font-bold text-blue-700">
              Latest Transcript
            </h2>

            <p className="text-gray-700">
              {transcript}
            </p>
          </div>
        )}

        <input
          type="text"
          placeholder="🔍 Search transcripts..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="mt-8 mb-4 w-full rounded-lg border p-3"
        />

        <h2 className="mb-4 text-2xl font-bold">
          History
        </h2>

        {history
          .filter((item) =>
            item.text
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              )
          )
          .map((item) => (
            <div
              key={item._id}
              className="mb-4 rounded-xl border bg-white p-5 shadow"
            >
              <h3 className="font-bold text-blue-600">
                {item.originalName}
              </h3>

              <p className="mt-2 text-gray-700">
                {item.text}
              </p>

              <small className="block text-gray-500">
                {new Date(
                  item.createdAt
                ).toLocaleString()}
              </small>

              <div className="mt-3 flex flex-wrap gap-2">
  <button
    onClick={() => {
      navigator.clipboard.writeText(item.text);
      alert("Copied!");
    }}
    className="rounded bg-green-600 px-3 py-1 text-white"
  >
    Copy
  </button>

                  <button
                  onClick={() =>
                    deleteTranscript(
                      item._id
                    )
                  }
                  className="rounded bg-red-600 px-3 py-1 text-white"
                >
                  Delete
                </button>

                <button
                  onClick={() =>
                    downloadTranscript(
                      item.text,
                      item.originalName
                    )
                  }
                  className="rounded bg-purple-600 px-3 py-1 text-white"
                >
                  Download TXT
                </button>

                <button
                  onClick={() =>
                    downloadPDF(
                      item.text,
                      item.originalName
                    )
                  }
                  className="rounded bg-orange-600 px-3 py-1 text-white"
                >
                  PDF
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default App;