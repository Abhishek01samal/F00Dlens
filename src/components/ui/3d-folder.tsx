"use client"

import { useState, useRef, forwardRef, memo } from "react"
import { cn } from "@/lib/utils"
import { Scale, FileSearch, Apple, LucideIcon } from "lucide-react"

interface FolderProject {
  id: string
  image: string
  title: string
}

interface AnimatedFolderProps {
  title: string
  description: string
  icon: LucideIcon
  projects: FolderProject[]
  className?: string
  onClick?: () => void
  isActive?: boolean
  isLoading?: boolean | undefined
}

interface ProjectCardProps {
  image: string
  title: string
  delay: number
  isVisible: boolean
  index: number
}

const ProjectCard = forwardRef<HTMLDivElement, ProjectCardProps>(
  ({ image, title, delay, isVisible, index }, ref) => {
    const rotations = [-12, 0, 12]
    const translations = [-55, 0, 55]

    return (
      <div
        ref={ref}
        className={cn(
          "absolute w-20 h-28 rounded-lg overflow-hidden shadow-xl",
          "bg-card border border-border",
        )}
        style={{
          transform: isVisible
            ? `translateY(-90px) translateX(${translations[index]}px) rotate(${rotations[index]}deg) scale(1)`
            : "translateY(0px) translateX(0px) rotate(0deg) scale(0.5)",
          opacity: isVisible ? 1 : 0,
          transition: `all 600ms cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`,
          zIndex: 10 - index,
          left: "-40px",
          top: "-56px",
        }}
      >
        <img src={image} alt={title} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <p className="absolute bottom-1.5 left-1.5 right-1.5 text-[10px] font-medium text-primary-foreground truncate">
          {title}
        </p>
      </div>
    )
  }
)

ProjectCard.displayName = "ProjectCard"

export const AnimatedFolder = memo(({ 
  title, 
  description, 
  icon: Icon, 
  projects, 
  className, 
  onClick,
  isActive,
  isLoading 
}: AnimatedFolderProps) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center",
        "p-6 rounded-2xl cursor-pointer",
        "bg-card/80 backdrop-blur-sm border border-border",
        "transition-all duration-500 ease-out",
        "hover:shadow-2xl hover:shadow-primary/20",
        "hover:border-primary/50",
        isActive && "border-primary shadow-lg shadow-primary/30",
        isLoading && "opacity-50 pointer-events-none",
        "group",
        className,
      )}
      style={{
        minWidth: "200px",
        minHeight: "240px",
        perspective: "1000px",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 rounded-2xl transition-opacity duration-500"
        style={{
          background: "radial-gradient(circle at 50% 70%, hsl(var(--primary)) 0%, transparent 70%)",
          opacity: isHovered ? 0.1 : 0,
        }}
      />

      <div className="relative flex items-center justify-center mb-4" style={{ height: "120px", width: "160px" }}>
        {/* Folder back */}
        <div
          className="absolute w-24 h-18 bg-primary/30 rounded-lg shadow-md"
          style={{
            transformOrigin: "bottom center",
            transform: isHovered ? "rotateX(-15deg)" : "rotateX(0deg)",
            transition: "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            zIndex: 10,
          }}
        />

        {/* Folder tab */}
        <div
          className="absolute w-10 h-3 bg-primary/40 rounded-t-md"
          style={{
            top: "calc(50% - 36px - 10px)",
            left: "calc(50% - 48px + 12px)",
            transformOrigin: "bottom center",
            transform: isHovered ? "rotateX(-25deg) translateY(-2px)" : "rotateX(0deg)",
            transition: "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            zIndex: 10,
          }}
        />

        {/* Project cards */}
        <div
          className="absolute"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 20,
          }}
        >
          {projects.slice(0, 3).map((project, index) => (
            <ProjectCard
              key={project.id}
              image={project.image}
              title={project.title}
              delay={index * 80}
              isVisible={isHovered}
              index={index}
            />
          ))}
        </div>

        {/* Folder front */}
        <div
          className="absolute w-24 h-18 bg-primary/50 rounded-lg shadow-lg flex items-center justify-center"
          style={{
            top: "calc(50% - 36px + 4px)",
            transformOrigin: "bottom center",
            transform: isHovered ? "rotateX(25deg) translateY(8px)" : "rotateX(0deg)",
            transition: "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            zIndex: 30,
          }}
        >
          <Icon className={cn(
            "w-8 h-8 text-primary-foreground transition-all duration-300",
            isHovered && "scale-110"
          )} />
        </div>
      </div>

      {/* Title */}
      <h3
        className="text-base font-semibold text-foreground mt-2 transition-all duration-300 text-center drop-shadow-sm"
        style={{
          transform: isHovered ? "translateY(4px)" : "translateY(0)",
        }}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className="text-xs text-muted-foreground text-center mt-1 transition-all duration-300 max-w-[180px]"
        style={{
          opacity: isHovered ? 1 : 0.7,
        }}
      >
        {description}
      </p>

      {/* Hover hint */}
      <div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground transition-all duration-300"
        style={{
          opacity: isHovered ? 0 : 0.5,
          transform: isHovered ? "translateY(10px)" : "translateY(0)",
        }}
      >
        Click to select
      </div>
    </div>
  )
})

AnimatedFolder.displayName = "AnimatedFolder"

// Mode data
const modeData = [
  {
    id: "comparison",
    title: "Compare Products",
    description: "Compare two food products side by side",
    icon: Scale,
    projects: [
      { id: "1", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=280&fit=crop", title: "Product A" },
      { id: "2", image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=200&h=280&fit=crop", title: "Product B" },
      { id: "3", image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=200&h=280&fit=crop", title: "Comparison" },
    ],
  },
  {
    id: "info",
    title: "Product / Food Info",
    description: "Detailed info about products or dishes",
    icon: FileSearch,
    projects: [
      { id: "1", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=280&fit=crop", title: "Nutrition" },
      { id: "2", image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=200&h=280&fit=crop", title: "History" },
      { id: "3", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=280&fit=crop", title: "Analysis" },
    ],
  },
  {
    id: "diet",
    title: "Diet Planner",
    description: "Create personalized diet plans",
    icon: Apple,
    projects: [
      { id: "1", image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=200&h=280&fit=crop", title: "Breakfast" },
      { id: "2", image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&h=280&fit=crop", title: "Lunch" },
      { id: "3", image: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=200&h=280&fit=crop", title: "Dinner" },
    ],
  },
]

interface FolderModeSelectorProps {
  onSelect: (mode: string) => void
  isLoading?: boolean
  activeMode?: string | null
}

export const FolderModeSelector = memo(({ onSelect, isLoading, activeMode }: FolderModeSelectorProps) => {
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <p className="text-xl md:text-2xl font-light text-foreground text-center max-w-lg leading-relaxed drop-shadow-sm">
        What would you like to analyze today?
      </p>
      <p className="text-xs text-muted-foreground tracking-[0.2em] uppercase drop-shadow-sm">
        Select a mode to get started
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
        {modeData.map((mode) => (
          <AnimatedFolder
            key={mode.id}
            title={mode.title}
            description={mode.description}
            icon={mode.icon}
            projects={mode.projects}
            onClick={() => onSelect(mode.id)}
            isActive={activeMode === mode.id}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  )
})

FolderModeSelector.displayName = "FolderModeSelector"
