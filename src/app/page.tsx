'use client'

import { useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { TaskItem } from 'components/TaskItem'
import { Badge } from 'components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from 'components/ui/chart'
import { TooltipProvider } from 'components/ui/tooltip'
import { CheckSquare, Repeat } from 'lucide-react'
import { CartesianGrid, Cell, Label, Line, LineChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { api } from 'trpc/react'

const categoryColors = ['#f97316', '#ec4899', '#14b8a6', '#a855f7', '#3b82f6', '#22c55e']

export default function Dashboard() {
    const { data: categories } = api.category.getCategories.useQuery()
    const { data: levelHistory } = api.category.getLevelHistory.useQuery()
    const { data: tasks } = api.task.getTasks.useQuery()

    const categoriesColors =
        categories && categories.length > 0
            ? categories.reduce(
                  (acc, category, index) => {
                      acc[category.id] = categoryColors[index % categoryColors.length] ?? ''
                      return acc
                  },
                  {} as Record<string, string>,
              )
            : {}

    const chartConfig =
        categories && categories.length > 0
            ? categories.reduce((acc, category, index) => {
                  acc[category.name] = {
                      color: categoryColors[index % categoryColors.length],
                  }
                  return acc
              }, {} as ChartConfig)
            : {}

    return (
        <TooltipProvider>
            <main className="grid min-h-screen grid-cols-1 gap-6 p-4 md:grid-cols-12 md:p-8">
                <Card className="md:col-span-5">
                    <CardHeader>
                        <CardTitle className="text-2xl">Today Tasks</CardTitle>
                        <div className="mt-2 flex items-center space-x-4 text-xs text-muted-foreground">
                            <div className="flex items-center">
                                <div className="mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                    <CheckSquare className="h-2.5 w-2.5" />
                                </div>
                                <span>Task</span>
                            </div>
                            <div className="flex items-center">
                                <div className="mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                                    <Repeat className="h-2.5 w-2.5" />
                                </div>
                                <span>Habit</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex max-h-[calc(100vh-12rem)] flex-col gap-2 overflow-y-auto pr-2">
                        {tasks?.map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                categoryColor={categoriesColors[task.categoryId] ?? ''}
                            />
                        ))}
                    </CardContent>
                </Card>

                {/* Character Level with Spheres Progress - now wider */}
                <Card className="md:col-span-7">
                    <CardHeader>
                        <CardTitle className="text-2xl">Your Level</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center pr-24">
                            <div className="mb-6 h-72 w-1/2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categories?.map((category) => ({
                                                name: category.name,
                                                value: category.level,
                                            }))}
                                            innerRadius={95}
                                            outerRadius={120}
                                            fill="#8884d8"
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {categories?.map((category) => (
                                                <Cell
                                                    key={`cell-${category.id}`}
                                                    fill={categoriesColors[category.id]}
                                                />
                                            ))}
                                            <Label
                                                content={({ viewBox }) => {
                                                    const cx = (viewBox as { cx: number })?.cx ?? 0
                                                    const cy = (viewBox as { cy: number })?.cy ?? 0
                                                    return (
                                                        <text
                                                            x={cx}
                                                            y={cy}
                                                            textAnchor="middle"
                                                            dominantBaseline="middle"
                                                        >
                                                            <tspan
                                                                x={cx}
                                                                y={cy}
                                                                fontSize="24"
                                                                fontWeight="bold"
                                                                fill="#333"
                                                            >
                                                                Level{' '}
                                                                {Math.round(
                                                                    (categories?.reduce(
                                                                        (acc, category) => acc + category.level,
                                                                        0,
                                                                    ) ?? 1) / (categories?.length ?? 1),
                                                                )}
                                                            </tspan>
                                                        </text>
                                                    )
                                                }}
                                            />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Spheres Progress */}
                            <div className="w-1/2 space-y-4">
                                {categories?.map((category) => (
                                    <div key={category.id} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">{category.name}</span>
                                                <Badge
                                                    variant="secondary"
                                                    style={{
                                                        color: categoriesColors[category.id],
                                                        backgroundColor: categoriesColors[category.id] + '20',
                                                    }}
                                                >
                                                    Level {category.level}
                                                </Badge>
                                            </div>
                                            <span className="text-sm text-muted-foreground">
                                                {Intl.NumberFormat('en-US', {
                                                    style: 'percent',
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 2,
                                                }).format(category.experience / category.experienceToNextLevel)}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                            <div
                                                className="h-full transition-all duration-500"
                                                style={{
                                                    width: `${(category.experience / category.experienceToNextLevel) * 100}%`,
                                                    backgroundColor: categoriesColors[category.id],
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <CardTitle className="mb-6 text-xl">History of progression</CardTitle>
                        <ChartContainer className="h-96 w-full" config={chartConfig}>
                            <LineChart
                                accessibilityLayer
                                data={levelHistory}
                                margin={{
                                    left: -30,
                                    right: 12,
                                    top: 5,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid vertical={false} />
                                <YAxis domain={[0, 10]} tickLine={false} axisLine={false} tickMargin={8} />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                {Object.keys(chartConfig).map((category) => (
                                    <Line
                                        key={category}
                                        dataKey={category}
                                        type="monotone"
                                        stroke={chartConfig[category]?.color}
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                ))}
                            </LineChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </main>
        </TooltipProvider>
    )
}
