import { useEffect, useRef, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/transcriptions/history`
      );

      setHistory(res.data);
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

      fetchHistory();

      setFile(null);
    } catch (err) {
      console.log(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow">

        <h1 className="mb-6 text-center text-4xl font-bold">
          Speech To Text Converter
        </h1>

        <input
          type="file"
          accept="audio/*"
          onChange={(e) =>
            setFile(e.target.files[0])
          }
          className="mb-4 w-full"
        />

        <div className="mb-4 flex gap-3">

          {!recording ? (
            <button
              onClick={startRecording}
              className="rounded bg-green-600 px-5 py-2 text-white"
            >
              🎤 Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="rounded bg-red-600 px-5 py-2 text-white"
            >
              ⏹ Stop Recording
            </button>
          )}

          <button
            onClick={uploadAudio}
            className="rounded bg-blue-600 px-5 py-2 text-white"
          >
            {loading
              ? "Converting..."
              : "Upload Audio"}
          </button>

        </div>

        {transcript && (
          <div className="mt-6 rounded bg-slate-100 p-4">
            <h2 className="mb-2 text-xl font-bold">
              Latest Transcript
            </h2>

            <p>{transcript}</p>
          </div>
        )}

        <h2 className="mt-8 mb-4 text-2xl font-bold">
          History
        </h2>

        {history.length === 0 ? (
          <p>No transcripts yet.</p>
        ) : (
          history.map((item) => (
            <div
              key={item._id}
              className="mb-4 rounded border p-4"
            >
              <h3 className="font-semibold">
                {item.originalName}
              </h3>

              <p>{item.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;