import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')

# Set style first, then customize
plt.style.use('seaborn-v0_8-darkgrid')
plt.rcParams['font.family'] = 'DejaVu Sans'
plt.rcParams['figure.facecolor'] = '#1a1a2e'
plt.rcParams['axes.facecolor'] = '#1a1a2e'
plt.rcParams['text.color'] = 'white'
plt.rcParams['axes.labelcolor'] = 'white'
plt.rcParams['xtick.color'] = 'white'
plt.rcParams['ytick.color'] = 'white'
plt.rcParams['axes.edgecolor'] = '#333355'
plt.rcParams['grid.color'] = '#333355'

# Color palette matching Sleepless brand
colors = {
    'primary': '#ff6b6b',
    'secondary': '#4ade80',
    'tertiary': '#fbbf24',
    'quaternary': '#60a5fa',
    'quinary': '#a78bfa'
}

# Chart 1: Revenue Breakdown Pie Chart (Year 3)
fig1, ax1 = plt.subplots(figsize=(10, 8))
revenue_labels = ['Transaction Fees\nR41.25M', 'Subscriptions\nR13.5M', 'Advertising\nR11.25M', 
                  'Premium Features\nR6M', 'Data Services\nR3M']
revenue_sizes = [55, 18, 15, 8, 4]
revenue_colors = [colors['primary'], colors['secondary'], colors['tertiary'], 
                  colors['quaternary'], colors['quinary']]
explode = (0.05, 0, 0, 0, 0)

wedges, texts, autotexts = ax1.pie(revenue_sizes, explode=explode, labels=revenue_labels, 
                                   colors=revenue_colors, autopct='%1.0f%%',
                                   shadow=False, startangle=90,
                                   textprops={'color': 'white', 'fontsize': 11})
for autotext in autotexts:
    autotext.set_color('white')
    autotext.set_fontweight('bold')
    autotext.set_fontsize(12)

ax1.set_title('Revenue Breakdown - Year 3\nTotal: R75 Million', fontsize=16, fontweight='bold', 
              color='white', pad=20)
plt.tight_layout()
plt.savefig('chart_revenue_breakdown.png', dpi=150, facecolor='#1a1a2e', 
            edgecolor='none', bbox_inches='tight')
plt.close()

# Chart 2: 3-Year Growth Projections (Line Chart)
fig2, ax2 = plt.subplots(figsize=(12, 7))
years = ['Year 1', 'Year 2', 'Year 3']
users = [50, 200, 500]  # in thousands
revenue = [3.5, 22, 75]  # in millions
gmv = [18, 120, 440]  # in millions

ax2_twin = ax2.twinx()

line1 = ax2.plot(years, users, 'o-', color=colors['primary'], linewidth=3, 
                 markersize=12, label='Users (thousands)')
line2 = ax2.plot(years, revenue, 's-', color=colors['secondary'], linewidth=3, 
                 markersize=12, label='Revenue (R millions)')
line3 = ax2_twin.plot(years, gmv, '^-', color=colors['tertiary'], linewidth=3, 
                      markersize=12, label='GMV (R millions)')

ax2.set_xlabel('', fontsize=12)
ax2.set_ylabel('Users (K) / Revenue (R M)', fontsize=12, color='white')
ax2_twin.set_ylabel('GMV (R Millions)', fontsize=12, color=colors['tertiary'])
ax2_twin.tick_params(axis='y', labelcolor=colors['tertiary'])
ax2_twin.spines['right'].set_color(colors['tertiary'])

# Add value labels
for i, (u, r, g) in enumerate(zip(users, revenue, gmv)):
    ax2.annotate(f'{u}K', (years[i], u), textcoords="offset points", 
                 xytext=(0, 15), ha='center', fontsize=11, color=colors['primary'], fontweight='bold')
    ax2.annotate(f'R{r}M', (years[i], r), textcoords="offset points", 
                 xytext=(0, -20), ha='center', fontsize=11, color=colors['secondary'], fontweight='bold')
    ax2_twin.annotate(f'R{g}M', (years[i], g), textcoords="offset points", 
                      xytext=(0, 15), ha='center', fontsize=11, color=colors['tertiary'], fontweight='bold')

lines = line1 + line2 + line3
labels = [l.get_label() for l in lines]
ax2.legend(lines, labels, loc='upper left', facecolor='#252545', edgecolor='#333355',
           labelcolor='white', fontsize=10)

ax2.set_title('3-Year Growth Projections', fontsize=16, fontweight='bold', color='white', pad=20)
ax2.set_ylim(0, 550)
ax2_twin.set_ylim(0, 500)
plt.tight_layout()
plt.savefig('chart_growth_projections.png', dpi=150, facecolor='#1a1a2e', 
            edgecolor='none', bbox_inches='tight')
plt.close()

# Chart 3: Market Size Bar Chart
fig3, ax3 = plt.subplots(figsize=(10, 7))
segments = ['Live Entertainment\n& Concerts', 'Clubs, Bars\n& Lounges', 
            'Festivals &\nOutdoor Events', 'Private &\nCorporate Events']
values = [15, 12, 8, 5]
bar_colors = [colors['primary'], colors['secondary'], colors['tertiary'], colors['quaternary']]

bars = ax3.barh(segments, values, color=bar_colors, height=0.6, edgecolor='white', linewidth=0.5)

for bar, value in zip(bars, values):
    ax3.text(value + 0.3, bar.get_y() + bar.get_height()/2, f'R{value}B', 
             va='center', ha='left', fontsize=12, fontweight='bold', color='white')

ax3.set_xlabel('Market Size (R Billions)', fontsize=12, color='white')
ax3.set_title('South African Entertainment Market\nTotal Addressable Market: R40+ Billion', 
              fontsize=16, fontweight='bold', color='white', pad=20)
ax3.set_xlim(0, 18)
ax3.invert_yaxis()
plt.tight_layout()
plt.savefig('chart_market_size.png', dpi=150, facecolor='#1a1a2e', 
            edgecolor='none', bbox_inches='tight')
plt.close()

# Chart 4: Use of Funds Donut Chart
fig4, ax4 = plt.subplots(figsize=(10, 8))
fund_labels = ['Product Development\nR2M', 'Marketing & Growth\nR1.5M', 
               'Operations & Team\nR1M', 'Legal & Compliance\nR300K', 'Reserve\nR200K']
fund_sizes = [40, 30, 20, 6, 4]
fund_colors = [colors['primary'], colors['secondary'], colors['tertiary'], 
               colors['quaternary'], colors['quinary']]

wedges, texts, autotexts = ax4.pie(fund_sizes, labels=fund_labels, colors=fund_colors,
                                   autopct='%1.0f%%', startangle=90,
                                   textprops={'color': 'white', 'fontsize': 10},
                                   pctdistance=0.75, wedgeprops=dict(width=0.5))
for autotext in autotexts:
    autotext.set_color('white')
    autotext.set_fontweight('bold')
    autotext.set_fontsize(11)

# Add center text
ax4.text(0, 0, 'R5M\nSeed Round', ha='center', va='center', fontsize=14, 
         fontweight='bold', color='white')

ax4.set_title('Use of Funds', fontsize=16, fontweight='bold', color='white', pad=20)
plt.tight_layout()
plt.savefig('chart_use_of_funds.png', dpi=150, facecolor='#1a1a2e', 
            edgecolor='none', bbox_inches='tight')
plt.close()

# Chart 5: User Growth Trajectory
fig5, ax5 = plt.subplots(figsize=(12, 6))
months = ['M1', 'M3', 'M6', 'M9', 'M12', 'M18', 'M24', 'M30', 'M36']
user_growth = [5, 10, 25, 40, 50, 100, 200, 350, 500]  # thousands

ax5.fill_between(months, user_growth, alpha=0.3, color=colors['primary'])
ax5.plot(months, user_growth, 'o-', color=colors['primary'], linewidth=3, markersize=10)

for i, (m, u) in enumerate(zip(months, user_growth)):
    ax5.annotate(f'{u}K', (m, u), textcoords="offset points", 
                 xytext=(0, 12), ha='center', fontsize=10, color='white', fontweight='bold')

ax5.set_xlabel('Timeline', fontsize=12, color='white')
ax5.set_ylabel('Registered Users (Thousands)', fontsize=12, color='white')
ax5.set_title('User Growth Trajectory', fontsize=16, fontweight='bold', color='white', pad=20)
ax5.set_ylim(0, 550)
plt.tight_layout()
plt.savefig('chart_user_growth.png', dpi=150, facecolor='#1a1a2e', 
            edgecolor='none', bbox_inches='tight')
plt.close()

print("All charts generated successfully!")
