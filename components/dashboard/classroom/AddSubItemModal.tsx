"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Upload, File as FileIcon } from "lucide-react";
import { useCloudinaryUpload } from "@/app/hooks/use-cloudinary-upload";
import { cloudinaryConfig } from "@/app/config/cloudinary";

interface AddSubItemModalProps {
  topicId: string;
  cohortId: string;
  cohortCourseId: string;
  onClose: () => void;
  onSuccess: () => void;
  initialType?: ItemType;
}

type ItemType = "assignment" | "material" | "recording";

interface QuizQuestion {
  id: string;
  question: string;
  points: number;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}
const AddSubItemModal: React.FC<AddSubItemModalProps> = ({
  topicId,
  cohortId,
  cohortCourseId,
  onClose,
  onSuccess,
  initialType = "assignment",
}) => {
  const [selectedTopicId, setSelectedTopicId] = useState(topicId);
  const [showNewTopicInput, setShowNewTopicInput] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [itemType, setItemType] = useState<ItemType>(initialType);
  const [isQuiz, setIsQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  
  const { uploadFile, isUploading } = useCloudinaryUpload(
    cloudinaryConfig.uploadPreset,
    cloudinaryConfig.cloudName
  );

  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    // Assignment specific
    instructions: "",
    dueDate: "",
    points: "",
    // Material specific
    fileUrl: "",
    fileType: "pdf",
    // Recording specific
    recordingUrl: "",
  });

  const { data: topicsData } = useQuery({
    queryKey: ["manageTopics", cohortId],
    queryFn: async () => {
      const response = await api.get(`/api/classroom/${cohortId}/topics`);
      return response.data;
    },
    enabled: !!cohortId,
  });

  const topics = topicsData?.topics;

  const addSubItemMutation = useMutation({
    mutationFn: async () => {
      let finalTopicId = selectedTopicId;

      // Handle new topic creation first if needed
      if (showNewTopicInput && newTopicTitle.trim()) {
        const topicResponse = await api.post("/api/classroom/topics", {
          title: newTopicTitle.trim(),
          cohortCourseId,
        });
        finalTopicId = topicResponse.data.topic.id;
      }

      let dataToSend: any = {
        title: formData.title,
        description: formData.description,
      };

      if (itemType === "assignment" && isQuiz) {
        const totalQuizPoints = quizQuestions.reduce((sum, q) => sum + (q.points || 0), 0);
        
        const quizData = {
          title: formData.title.trim(),
          description: formData.description?.trim() || "",
          instructions: formData.instructions?.trim() || "",
          dueDate: formData.dueDate || null,
          points: totalQuizPoints,
          classroomTopicId: finalTopicId || null,
          cohortCourseId, // Include cohortCourseId as topicId is now optional
          questions: quizQuestions.map(q => ({
            question: q.question.trim(),
            points: q.points || 1,
            options: q.options.map(opt => ({
              text: opt.text.trim(),
              isCorrect: opt.isCorrect
            }))
          }))
        };

        const response = await api.post("/api/assignments/create-quiz", quizData);
        return response.data;
      }

      // Existing logic for other types
      switch (itemType) {
        case "assignment":
          dataToSend = {
            ...dataToSend,
            instructions: formData.instructions,
            dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
            points: formData.points ? parseInt(formData.points) : undefined,
          };
          break;
        case "material":
          let finalImageUrl = undefined;
          let finalFileUrl = formData.fileUrl || undefined;
          
          if (materialFile) {
            try {
              if (materialFile.type.startsWith("image/")) {
                finalImageUrl = await uploadFile(materialFile);
              } else {
                const uploadFormData = new FormData();
                uploadFormData.append("file", materialFile);
                const uploadRes = await api.post("/api/upload/document", uploadFormData, {
                  headers: { "Content-Type": "multipart/form-data" }
                });
                finalFileUrl = uploadRes.data.url;
              }
            } catch (error) {
              throw new Error("Failed to upload the material file.");
            }
          }
          dataToSend = {
            ...dataToSend,
            fileUrl: finalFileUrl,
            imageUrl: finalImageUrl,
            fileType: formData.fileType,
          };
          break;
        case "recording":
          dataToSend = {
            ...dataToSend,
            recordingUrl: formData.recordingUrl,
          };
          break;
      }

      const response = await api.post("/api/classroom/items", {
        topicId: finalTopicId || null,
        cohortCourseId, // Always send cohortCourseId now
        type: itemType,
        data: dataToSend,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manageTopics"] });
      queryClient.invalidateQueries({ queryKey: ["classroomTopics"] });
      queryClient.invalidateQueries({ queryKey: ["classroom"] });
      queryClient.invalidateQueries({ queryKey: ["streamActivities"] });
      toast.success("Item added successfully");
      onSuccess();
    },
  });

  // Quiz question management
  const addQuestion = () => {
    setQuizQuestions([
      ...quizQuestions,
      {
        id: Date.now().toString(),
        question: "",
        points: 1,
        options: [
          { id: Date.now().toString() + "-1", text: "", isCorrect: false },
          { id: Date.now().toString() + "-2", text: "", isCorrect: false },
          { id: Date.now().toString() + "-3", text: "", isCorrect: false },
          { id: Date.now().toString() + "-4", text: "", isCorrect: false },
        ],
      },
    ]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...quizQuestions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuizQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, field: string, value: any) => {
    const updatedQuestions = [...quizQuestions];
    updatedQuestions[questionIndex].options[optionIndex] = {
      ...updatedQuestions[questionIndex].options[optionIndex],
      [field]: value,
    };
    setQuizQuestions(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
  };

  const setCorrectAnswer = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...quizQuestions];
    updatedQuestions[questionIndex].options.forEach((option, idx) => {
      option.isCorrect = idx === optionIndex;
    });
    setQuizQuestions(updatedQuestions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate quiz questions
    if (isQuiz) {
      if (quizQuestions.length === 0) {
        toast.error("Please add at least one question to the quiz");
        return;
      }

      for (let i = 0; i < quizQuestions.length; i++) {
        const question = quizQuestions[i];
        if (!question.question.trim()) {
          toast.error(`Question ${i + 1} is required`);
          return;
        }
        if (question.options.some(opt => !opt.text.trim())) {
          toast.error(`All options for question ${i + 1} are required`);
          return;
        }
        if (!question.options.some(opt => opt.isCorrect)) {
          toast.error(`Please select a correct answer for question ${i + 1}`);
          return;
        }
      }
    }



    addSubItemMutation.mutate();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Backdrop click disabled as per user request
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      instructions: "",
      dueDate: "",
      points: "",
      fileUrl: "",
      fileType: "pdf",
      recordingUrl: "",
    });
    setMaterialFile(null);
    setQuizQuestions([]);
    setIsQuiz(false);
  };

  const handleTypeChange = (newType: ItemType) => {
    setItemType(newType);
    resetForm();
  };

  const getItemTypeDisplay = (type: ItemType) => {
    switch (type) {
      case "assignment":
        return "Assignment";
      case "material":
        return "Material";
      case "recording":
        return "Recording";
      default:
        return type;
    }
  };

  const minDateTime = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Add Content to{" "}
              {showNewTopicInput ? "New Topic" : "Classroom"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Choose the type of content and specify the topic
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Topic Selection */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Classroom Topic
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowNewTopicInput(!showNewTopicInput);
                  if (!showNewTopicInput) {
                    setSelectedTopicId("");
                  } else {
                    setSelectedTopicId(topics?.[0]?.id || "");
                  }
                }}
                className="text-xs text-[#6742FA] hover:text-[#5235c7] font-medium"
              >
                {showNewTopicInput ? "← Select existing topic" : "+ Create new topic"}
              </button>
            </div>

            {showNewTopicInput ? (
              <input
                type="text"
                placeholder="Enter new topic title (e.g. Week 1: Introduction)"
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                className="w-full px-3 py-2 border border-[#6742FA] rounded-md focus:outline-none focus:ring-2 focus:ring-[#6742FA] bg-white"
                autoFocus
              />
            ) : (
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6742FA] bg-white"
              >
                <option value="">Select a Topic</option>
                {topics?.map((topic: any) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.title}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Item Type Selection */}
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {(["assignment", "material", "recording"] as ItemType[]).map(
              (type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeChange(type)}
                  className={`p-3 md:p-4 border-2 rounded-xl text-center transition-all ${
                    itemType === type
                      ? "border-[#6742FA] bg-[#6742FA0D] shadow-sm"
                      : "border-gray-100 hover:border-gray-200 text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <div className="text-xl md:text-2xl mb-1 md:mb-2">
                    {type === "assignment" && "📝"}
                    {type === "material" && "📎"}
                    {type === "recording" && "🎥"}
                  </div>
                  <div className="text-[11px] md:text-sm font-bold uppercase tracking-tight">
                    {getItemTypeDisplay(type)}
                  </div>
                </button>
              )
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Common Fields */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder={`Enter ${itemType} title...`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6742FA] focus:border-[#6742FA]"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Add a description (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6742FA] focus:border-[#6742FA]"
            />
          </div>

          {/* Quiz Toggle for Assignments */}
          {itemType === "assignment" && (
            <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="isQuiz"
                checked={isQuiz}
                onChange={(e) => setIsQuiz(e.target.checked)}
                className="w-4 h-4 text-[#6742FA] border-gray-300 rounded focus:ring-[#6742FA]"
              />
              <label htmlFor="isQuiz" className="text-sm font-medium text-gray-700">
                This is a quiz assignment
              </label>
              {isQuiz && (
                <span className="ml-2 px-2 py-1 text-xs bg-[#6742FA1A] text-[#452da6] rounded-full">
                  🧩 Quiz Mode
                </span>
              )}
            </div>
          )}

          {/* Type-Specific Fields */}
          {itemType === "assignment" && !isQuiz && (
            <>
              <div>
                <label
                  htmlFor="instructions"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Instructions
                </label>
                <textarea
                  id="instructions"
                  rows={3}
                  value={formData.instructions}
                  onChange={(e) =>
                    setFormData({ ...formData, instructions: e.target.value })
                  }
                  placeholder="Assignment instructions..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6742FA] focus:border-[#6742FA]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="dueDate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Due Date
                  </label>
                   <input
                    type="datetime-local"
                    id="dueDate"
                    min={minDateTime}
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6742FA] focus:border-[#6742FA]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="points"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Points
                  </label>
                  <input
                    type="number"
                    id="points"
                    min="0"
                    value={formData.points}
                    onChange={(e) =>
                      setFormData({ ...formData, points: e.target.value })
                    }
                    placeholder="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6742FA] focus:border-[#6742FA]"
                  />
                </div>
              </div>
            </>
          )}

          {/* Quiz Questions Section */}
          {itemType === "assignment" && isQuiz && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Quiz Questions</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {quizQuestions.length} question{quizQuestions.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 flex items-center space-x-1"
                  >
                    <span>+</span>
                    <span>Add Question</span>
                  </button>
                </div>
              </div>

              {quizQuestions.map((question, questionIndex) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-md font-medium text-gray-900">
                      Question {questionIndex + 1}
                    </h4>
                    {quizQuestions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(questionIndex)}
                        className="text-[#6742FA] hover:text-[#5235c7] text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question Text *
                      </label>
                      <input
                        type="text"
                        value={question.question}
                        onChange={(e) => updateQuestion(questionIndex, "question", e.target.value)}
                        placeholder="Enter the question..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6742FA]"
                        required
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Points
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={question.points}
                          onChange={(e) => updateQuestion(questionIndex, "points", parseInt(e.target.value) || 1)}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6742FA]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Options (Select the correct answer) *
                      </label>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div key={option.id} className="flex items-center space-x-3 p-2 border border-gray-200 rounded-md hover:bg-gray-50">
                            <input
                              type="radio"
                              name={`correct-answer-${questionIndex}`}
                              checked={option.isCorrect}
                              onChange={() => setCorrectAnswer(questionIndex, optionIndex)}
                              className="w-4 h-4 text-[#6742FA] border-gray-300 focus:ring-[#6742FA]"
                              required
                            />
                            <input
                              type="text"
                              value={option.text}
                              onChange={(e) => updateOption(questionIndex, optionIndex, "text", e.target.value)}
                              placeholder={`Option ${optionIndex + 1}`}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6742FA]"
                              required
                            />
                            {option.isCorrect && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                Correct
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {quizQuestions.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <div className="text-4xl mb-4">🧩</div>
                  <p className="text-gray-500 mb-2">No questions added yet.</p>
                  <p className="text-sm text-gray-400 mb-4">Add questions to create your quiz</p>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="bg-[#6742FA] text-white px-4 py-2 rounded-md hover:bg-[#5235c7] font-medium"
                  >
                    Add Your First Question
                  </button>
                </div>
              )}

              {/* Quiz Assignment Settings */}
              {quizQuestions.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Quiz Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="quizPoints"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Total Quiz Points
                      </label>
                      <input
                        type="number"
                        id="quizPoints"
                        min="0"
                        value={quizQuestions.reduce((sum, q) => sum + (q.points || 0), 0)}
                        readOnly
                        placeholder="0"
                        className="w-full px-3 py-2 border border-[#6742FA33] bg-[#6742FA0D] rounded-md focus:outline-none cursor-not-allowed font-bold text-[#6742FA]"
                      />
                      <p className="text-[10px] text-[#6742FA] mt-1 italic">Total sum of question points</p>
                    </div>
                    <div>
                      <label
                        htmlFor="quizDueDate"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Due Date
                      </label>
                      <input
                        type="datetime-local"
                        id="quizDueDate"
                        min={minDateTime}
                        value={formData.dueDate}
                        onChange={(e) =>
                          setFormData({ ...formData, dueDate: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6742FA] focus:border-[#6742FA]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Existing material and recording fields */}
          {itemType === "material" && (
            <>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                    <label
                      htmlFor="fileUrl"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Material Link URL (Optional)
                    </label>
                    <input
                      type="url"
                      id="fileUrl"
                      value={formData.fileUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, fileUrl: e.target.value })
                      }
                      placeholder="https://example.com/resource"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6742FA] focus:border-[#6742FA]"
                    />
                  </div>

                  <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload File/Image (Optional)
                    </label>
                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-50 hover:border-[#6742FA] transition-all text-center h-[42px] flex items-center justify-center">
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error("File size must be less than 5MB");
                              e.target.value = "";
                              return;
                            }
                            setMaterialFile(file);
                            // Auto-set fileType based on file extension
                            if (file.type.includes('image')) setFormData(prev => ({ ...prev, fileType: 'other' }));
                            if (file.type.includes('pdf')) setFormData(prev => ({ ...prev, fileType: 'pdf' }));
                            if (file.type.includes('word')) setFormData(prev => ({ ...prev, fileType: 'doc' }));
                          } else {
                            setMaterialFile(null);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
                      />
                      <div className="flex flex-col items-center gap-1 text-sm">
                        {materialFile ? (
                          <span className="text-[#6742FA] font-medium flex items-center gap-2">
                            <FileIcon className="w-4 h-4" /> {materialFile.name.substring(0, 15)}{materialFile.name.length > 15 ? "..." : ""}
                          </span>
                        ) : (
                          <>
                            <span className="text-gray-500 flex items-center gap-2">
                              <Upload className="w-4 h-4" /> Click to upload
                            </span>
                            <span className="text-xs text-gray-400 font-normal">Max 5MB</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="fileType"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  File Type
                </label>
                <select
                  id="fileType"
                  value={formData.fileType}
                  onChange={(e) =>
                    setFormData({ ...formData, fileType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6742FA] focus:border-[#6742FA]"
                >
                  <option value="pdf">PDF</option>
                  <option value="doc">Word Document</option>
                  <option value="docx">Word Document (DOCX)</option>
                  <option value="ppt">PowerPoint</option>
                  <option value="pptx">PowerPoint (PPTX)</option>
                  <option value="xls">Excel</option>
                  <option value="xlsx">Excel (XLSX)</option>
                  <option value="zip">ZIP Archive</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </>
          )}

          {itemType === "recording" && (
            <div>
              <label
                htmlFor="recordingUrl"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Recording URL *
              </label>
              <input
                type="url"
                id="recordingUrl"
                required
                value={formData.recordingUrl}
                onChange={(e) =>
                  setFormData({ ...formData, recordingUrl: e.target.value })
                }
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6742FA] focus:border-[#6742FA]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supports YouTube, Vimeo, or any direct video link
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6742FA]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addSubItemMutation.isPending || isUploading || !formData.title.trim()}
              className="px-6 py-2 bg-[#6742FA] text-white rounded-md hover:bg-[#5235c7] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {(addSubItemMutation.isPending || isUploading) ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                `Add ${isQuiz ? 'Quiz' : getItemTypeDisplay(itemType)}`
              )}
            </button>
          </div>
        </form>

        {addSubItemMutation.isError && (
          <div className="px-6 pb-4">
            <div className="bg-[#6742FA0D] border border-[#6742FA33] rounded-md p-3">
              <p className="text-sm text-[#6742FA]">
                Error:{" "}
                {addSubItemMutation.error instanceof Error
                  ? addSubItemMutation.error.message
                  : "Failed to add item"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddSubItemModal;