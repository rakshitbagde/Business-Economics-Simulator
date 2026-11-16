import React, { useState } from 'react';
import { GameState, EconomicsLesson, LeaderboardEntry } from '../types/game';
import { ECONOMICS_LESSONS } from '../data/gameData';
import { formatRupees } from '../utils/format';
import { DemandCurveGraph } from '../components/DemandCurveGraph';
import { soundFx } from '../utils/audio';
import {
  GraduationCap,
  Sliders,
  Award,
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  BookOpen,
  Sparkles,
} from 'lucide-react';

interface LearnViewProps {
  gameState: GameState;
  onCompleteQuiz: (lessonId: string, score: number, totalQuestions: number) => void;
}

export const LearnView: React.FC<LearnViewProps> = ({ gameState, onCompleteQuiz }) => {
  const [activeTab, setActiveTab] = useState<'lessons' | 'sandbox' | 'achievements' | 'leaderboard'>('lessons');
  const [activeQuizLesson, setActiveQuizLesson] = useState<EconomicsLesson | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [showQuestionResult, setShowQuestionResult] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // Demand Curve Sandbox State
  const [sandboxPrice, setSandboxPrice] = useState<number>(50);
  const [sandboxElasticity, setSandboxElasticity] = useState<number>(1.2);
  const [sandboxFootfall, setSandboxFootfall] = useState<number>(60);

  // Read Leaderboard from localStorage
  const leaderboard: LeaderboardEntry[] = (() => {
    try {
      return JSON.parse(localStorage.getItem('vyapaar_tycoon_leaderboard') || '[]');
    } catch {
      return [];
    }
  })();

  const startQuiz = (lesson: EconomicsLesson) => {
    setActiveQuizLesson(lesson);
    setCurrentQuestionIndex(0);
    setSelectedAnswerIndex(null);
    setShowQuestionResult(false);
    setQuizScore(0);
    setQuizFinished(false);
  };

  const handleSelectAnswer = (optionIdx: number) => {
    if (showQuestionResult || !activeQuizLesson) return;
    setSelectedAnswerIndex(optionIdx);
    setShowQuestionResult(true);

    const isCorrect = optionIdx === activeQuizLesson.questions[currentQuestionIndex].correctIndex;
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
      soundFx.playCoin();
    } else {
      soundFx.playError();
    }
  };

  const handleNextQuestion = () => {
    if (!activeQuizLesson) return;

    if (currentQuestionIndex + 1 < activeQuizLesson.questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswerIndex(null);
      setShowQuestionResult(false);
    } else {
      // Quiz finished
      setQuizFinished(true);
      onCompleteQuiz(activeQuizLesson.id, quizScore, activeQuizLesson.questions.length);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Subtab Segmented Control */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('lessons')}
          className={`flex-1 min-w-[90px] py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'lessons'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Lessons ({Object.keys(gameState.completedLessons).length}/10)</span>
        </button>

        <button
          onClick={() => setActiveTab('sandbox')}
          className={`flex-1 min-w-[90px] py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'sandbox'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Demand Curve Lab</span>
        </button>

        <button
          onClick={() => setActiveTab('achievements')}
          className={`flex-1 min-w-[90px] py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'achievements'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Achievements</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 min-w-[90px] py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'leaderboard'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Leaderboard</span>
        </button>
      </div>

      {/* TAB 1: ECONOMICS LESSONS & QUIZZES */}
      {activeTab === 'lessons' && (
        <div className="space-y-3">
          {/* Active Quiz Card if in progress */}
          {activeQuizLesson && (
            <div className="rounded-2xl border-2 border-emerald-500 bg-white dark:bg-slate-900 p-5 shadow-lg space-y-4">
              {!quizFinished ? (
                <>
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{activeQuizLesson.icon}</span>
                      <div>
                        <span className="text-[11px] text-slate-400 font-medium">
                          Question {currentQuestionIndex + 1} of {activeQuizLesson.questions.length}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {activeQuizLesson.title} Quiz
                        </h3>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveQuizLesson(null)}
                      className="text-xs text-slate-400 hover:text-slate-600 underline"
                    >
                      Exit Quiz
                    </button>
                  </div>

                  {/* Question */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                      {activeQuizLesson.questions[currentQuestionIndex].question}
                    </h4>

                    {/* Options */}
                    <div className="space-y-2">
                      {activeQuizLesson.questions[currentQuestionIndex].options.map((opt, idx) => {
                        const isSelected = selectedAnswerIndex === idx;
                        const isCorrect = idx === activeQuizLesson.questions[currentQuestionIndex].correctIndex;

                        let btnStyle = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300';
                        if (showQuestionResult) {
                          if (isCorrect) {
                            btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold';
                          } else if (isSelected && !isCorrect) {
                            btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectAnswer(idx)}
                            disabled={showQuestionResult}
                            className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {showQuestionResult && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                            {showQuestionResult && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Explanation after answer */}
                  {showQuestionResult && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                      <p className="text-slate-700 dark:text-slate-300">
                        {activeQuizLesson.questions[currentQuestionIndex].explanation}
                      </p>
                      <button
                        onClick={handleNextQuestion}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs cursor-pointer"
                      >
                        {currentQuestionIndex + 1 < activeQuizLesson.questions.length ? 'Next Question →' : 'Complete Quiz & Claim Reward'}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* Quiz Finished Card */
                <div className="text-center py-4 space-y-3">
                  <span className="text-4xl inline-block">🎉</span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Quiz Completed!</h3>
                  <p className="text-xs text-slate-500">
                    You scored <strong className="font-mono text-emerald-600 text-base">{quizScore} / {activeQuizLesson.questions.length}</strong>!
                  </p>
                  <div className="inline-block p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200">
                    Earned <strong className="font-mono">+{formatRupees(quizScore * 1000)}</strong> Cash and <strong className="font-mono">+{quizScore * 2}%</strong> Reputation!
                  </div>
                  <div>
                    <button
                      onClick={() => setActiveQuizLesson(null)}
                      className="px-6 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
                    >
                      Return to Lessons
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Lessons List */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Interactive Economics Academy</h3>
            <p className="text-xs text-slate-500">
              Master the financial principles governing business. Earn bonus cash & reputation for every quiz answered correctly!
            </p>
          </div>

          <div className="space-y-3">
            {ECONOMICS_LESSONS.map((lesson) => {
              const previousScore = gameState.completedLessons[lesson.id];
              const isCompleted = previousScore !== undefined;

              return (
                <div
                  key={lesson.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="text-2xl p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                        {lesson.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{lesson.title}</h4>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider">{lesson.concept}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{lesson.subtitle}</p>
                      </div>
                    </div>

                    {isCompleted ? (
                      <span className="text-[11px] font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg shrink-0">
                        Score: {previousScore}/5
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-lg shrink-0">
                        5 Qs Available
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl leading-relaxed">
                    {lesson.explanation}
                  </p>

                  <div className="text-xs text-slate-500 space-y-1">
                    <p>
                      <strong className="text-slate-700 dark:text-slate-300">Real-World Case:</strong> {lesson.realWorldExample}
                    </p>
                    <p>
                      <strong className="text-emerald-600 dark:text-emerald-400">Tycoon Tip:</strong> {lesson.tycoonStrategy}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                      onClick={() => startQuiz(lesson)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isCompleted ? 'Retake 5-Question Quiz' : 'Take 5-Question Quiz (+₹5,000)'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: DEMAND CURVE SANDBOX LAB */}
      {activeTab === 'sandbox' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Live Demand Curve Laboratory</h3>
            <p className="text-xs text-slate-500">
              Interactive economics sandbox: manipulate selling price, price elasticity, and customer footfall to observe how market equilibrium and revenue curves respond!
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4">
            {/* Interactive Graph */}
            <DemandCurveGraph
              basePrice={30}
              currentPrice={sandboxPrice}
              elasticity={sandboxElasticity}
              marketFootfall={sandboxFootfall}
              interactive={true}
              onPriceChange={setSandboxPrice}
              height={220}
            />

            {/* Sliders */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <div className="flex justify-between mb-1 text-slate-600 dark:text-slate-400">
                  <span>Price Elasticity: <strong className="font-mono text-blue-600">{sandboxElasticity.toFixed(1)}</strong></span>
                  <span>{sandboxElasticity > 1.2 ? 'Elastic (Luxury/Treat)' : sandboxElasticity < 0.8 ? 'Inelastic (Necessity)' : 'Unitary'}</span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="2.5"
                  step="0.1"
                  value={sandboxElasticity}
                  onChange={(e) => setSandboxElasticity(Number(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1 text-slate-600 dark:text-slate-400">
                  <span>Base Customer Footfall: <strong className="font-mono text-emerald-600">{sandboxFootfall} shoppers</strong></span>
                  <span>Market Reach</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="200"
                  step="5"
                  value={sandboxFootfall}
                  onChange={(e) => setSandboxFootfall(Number(e.target.value))}
                  className="w-full accent-emerald-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 leading-relaxed">
              💡 <strong>Core Economic Insight:</strong> Total Revenue is maximized at the point of unitary elasticity where the percentage drop in quantity demanded equals the percentage increase in price. Setting price too high destroys volume; setting price too low leaves money on the table.
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ACHIEVEMENTS */}
      {activeTab === 'achievements' && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Tycoon Milestones & Badges</h3>
            <p className="text-xs text-slate-500">
              Complete business milestones to unlock financial rewards and industry reputation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {gameState.achievements.map((ach) => (
              <div
                key={ach.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                  ach.unlocked
                    ? 'border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/10'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-60'
                }`}
              >
                <span className="text-3xl p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                  {ach.icon}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{ach.title}</h4>
                    {ach.unlocked && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{ach.description}</p>
                  <div className="flex items-center gap-2 text-[11px] font-mono mt-2 text-slate-600 dark:text-slate-300">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">+{formatRupees(ach.rewardCash)}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">+{ach.rewardReputation} Rep</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Hall of Tycoons (Local Leaderboard)</h3>
            <p className="text-xs text-slate-500">
              Top 5 business runs saved on this device. Reach ₹10,00,000 net worth to enter the hall of fame!
            </p>
          </div>

          {leaderboard.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-400">
              No completed runs yet. Grow your net worth to ₹10,00,000 to record your score!
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, idx) => (
                <div
                  key={entry.id || idx}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-lg text-slate-400 w-6">#{idx + 1}</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{entry.businessName}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{entry.daysPlayed} Days</span>
                        <span aria-hidden="true">·</span>
                        <span>{entry.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                        {formatRupees(entry.finalNetWorth)}
                      </span>
                    </div>
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                        entry.grade === 'A+' || entry.grade === 'A'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : entry.grade === 'B'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {entry.grade}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
